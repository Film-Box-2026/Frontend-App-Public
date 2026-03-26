import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { formatPrice, VIP_PACKAGES, VIPPackage } from '@/constants/vipPackages';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { vnpayService } from '@/services/api/vnpay';
import {
  getPaymentTransactions,
  savePaymentTransactions,
  saveSubscription,
} from '@/services/storage/storageService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addTransaction,
  PaymentTransaction,
  setError,
  setLoading,
  setSubscription,
} from '@/store/slices/PaymentSlice/paymentSlice';

type PaymentStep = 'idle' | 'confirm' | 'processing' | 'result';
type PaymentResultStatus = 'success' | 'failed' | 'cancelled' | 'timeout';

interface PaymentResult {
  status: PaymentResultStatus;
  message: string;
  transactionId: string;
  amount: number;
  planName: string;
  expiryDate?: string;
}

export const PaymentPage: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, subscription } = useAppSelector((state) => state.payment);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [activePackage, setActivePackage] = useState<VIPPackage | null>(null);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('idle');
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [pin, setPin] = useState('');
  const [formError, setFormError] = useState('');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const inputBorderColor =
    colorScheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const inputPlaceholderColor = colorScheme === 'dark' ? '#8A90A0' : '#9BA1A6';

  const navigateToTransactionHistory = () => {
    closePaymentFlow();
    router.push('/transactions');
  };

  const finishPaymentFlow = () => {
    closePaymentFlow();
    router.back();
  };

  const retryPayment = () => {
    setFormError('');
    setPaymentStep('confirm');
  };

  const goToTransactionHistory = () => {
    router.push('/transactions');
  };

  const sanitizeDigits = (value: string, maxLength: number) => {
    return value.replace(/[^0-9]/g, '').slice(0, maxLength);
  };

  const resetPaymentInputs = () => {
    setCardNumber('');
    setCvv('');
    setPin('');
  };

  const validatePaymentInputs = () => {
    if (!/^\d{3}$/.test(cvv)) {
      return 'CVV phải gồm đúng 3 số.';
    }

    if (!/^\d{16}$/.test(cardNumber)) {
      return 'Số thẻ phải gồm đúng 16 số.';
    }

    if (!/^\d{4}$/.test(pin)) {
      return 'PIN phải gồm đúng 4 số.';
    }

    return null;
  };

  const persistTransaction = async (transaction: PaymentTransaction) => {
    dispatch(addTransaction(transaction));
    const storedTransactions = await getPaymentTransactions();
    await savePaymentTransactions([...storedTransactions, transaction]);
  };

  const buildPaidSubscription = (plan: VIPPackage) => {
    const startDate = new Date();
    const expiryDate = new Date(
      startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000
    );

    return {
      subscription: {
        status: 'active' as const,
        plan: plan.plan,
        startDate: startDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        autoRenewal: true,
      },
      expiryDateIso: expiryDate.toISOString(),
    };
  };

  const closePaymentFlow = () => {
    setPaymentStep('idle');
    setFormError('');
    setPaymentResult(null);
    setActivePackage(null);
    resetPaymentInputs();
  };

  const handleUpgradePlan = useCallback(
    async (plan: VIPPackage) => {
      if (plan.plan === 'free') {
        const createdAt = new Date().toISOString();
        const freeTransactionId = `FREE_${Date.now()}`;
        const newSubscription = {
          status: 'active' as const,
          plan: 'free' as const,
          startDate: createdAt,
          expiryDate: createdAt,
          autoRenewal: false,
        };

        const freeTransaction: PaymentTransaction = {
          id: freeTransactionId,
          amount: 0,
          plan: 'free',
          status: 'success',
          createdAt,
        };

        await persistTransaction(freeTransaction);
        dispatch(setSubscription(newSubscription));
        await saveSubscription(newSubscription);
        setPaymentResult({
          status: 'success',
          message: 'Bạn đã chuyển sang gói Free thành công.',
          transactionId: freeTransactionId,
          amount: 0,
          planName: plan.name,
          expiryDate: createdAt,
        });
        setPaymentStep('result');
        return;
      }

      const inputError = validatePaymentInputs();
      if (inputError) {
        setFormError(inputError);
        return;
      }

      setFormError('');
      dispatch(setLoading(true));
      dispatch(setError(null));
      setPaymentStep('processing');

      try {
        const result = await vnpayService.mockPaymentFlow(plan.price, plan.plan, {
          cardNumber,
          cvv,
          pin,
        });

        const createdAt = new Date().toISOString();
        const transactionPayload: PaymentTransaction = {
          id: result.transactionId,
          amount: result.amount,
          plan: result.plan as typeof plan.plan,
          status: result.status,
          createdAt,
        };

        await persistTransaction(transactionPayload);

        if (result.status === 'success') {
          const { subscription: newSubscription, expiryDateIso } = buildPaidSubscription(plan);

          dispatch(setSubscription(newSubscription));
          await saveSubscription(newSubscription);

          setPaymentResult({
            status: 'success',
            message: 'Giao dịch đã được xử lý thành công.',
            transactionId: result.transactionId,
            amount: result.amount,
            planName: plan.name,
            expiryDate: expiryDateIso,
          });
        } else {
          setPaymentResult({
            status: result.status,
            message: result.message,
            transactionId: result.transactionId,
            amount: result.amount,
            planName: plan.name,
          });
        }

        setPaymentStep('result');
      } catch (error) {
        dispatch(setError('Có lỗi khi thanh toán'));
        setPaymentResult({
          status: 'failed',
          message: 'Có lỗi xảy ra, vui lòng thử lại.',
          transactionId: `ERR_${Date.now()}`,
          amount: plan.price,
          planName: plan.name,
        });
        setPaymentStep('result');
      } finally {
        dispatch(setLoading(false));
      }
    },
    [cardNumber, cvv, dispatch, pin]
  );

  const openPaymentFlow = (plan: VIPPackage) => {
    setActivePackage(plan);
    setSelectedPlan(plan.id);
    setFormError('');
    resetPaymentInputs();
    setPaymentResult(null);
    setPaymentStep('confirm');
  };

  const renderPackage = ({ item }: { item: VIPPackage }) => {
    const isSelected = selectedPlan === item.id;
    const isCurrentPlan = subscription?.plan === item.plan;

    return (
      <Pressable
        style={[
          styles.packageCard,
          {
            backgroundColor:
              colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderColor: isSelected ? item.color : 'transparent',
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => setSelectedPlan(item.id)}
      >
        {item.popular && (
          <LinearGradient
            colors={[item.color, `${item.color}80`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.popularBadge}
          >
            <Text style={styles.popularText}>Phổ biến nhất</Text>
          </LinearGradient>
        )}

        <View style={styles.packageHeader}>
          <Text style={[styles.packageName, { color: item.color }]}>
            {item.name}
          </Text>
          {isCurrentPlan && (
            <View
              style={[
                styles.currentBadge,
                { backgroundColor: item.color },
              ]}
            >
              <Text style={styles.currentText}>Hiện tại</Text>
            </View>
          )}
        </View>

        {item.price > 0 && (
          <>
            <Text style={[styles.price, { color: item.color }]}>
              {formatPrice(item.price)}
            </Text>
            <Text
              style={[
                styles.duration,
                { color: colorScheme === 'dark' ? '#DADCE2' : colors.text },
              ]}
            >
              /{item.durationLabel}
            </Text>
          </>
        )}

        <View style={styles.featuresList}>
          {item.features.map((feature, idx) => (
            <View key={idx} style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={item.color}
                style={styles.featureIcon}
              />
              <Text
                style={[
                  styles.featureText,
                  { color: colorScheme === 'dark' ? '#DABCE2' : colors.text },
                ]}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          style={[
            styles.selectButton,
            {
              backgroundColor: isSelected ? item.color : 'transparent',
              borderColor: item.color,
              borderWidth: 1,
            },
          ]}
          disabled={loading || isCurrentPlan}
          onPress={() => openPaymentFlow(item)}
        >
          <Text
            style={[
              styles.selectButtonText,
              { color: isSelected ? '#FFF' : item.color },
            ]}
          >
            {isCurrentPlan ? 'Hiện tại' : isSelected ? 'Thanh toán' : 'Chọn'}
          </Text>
        </Pressable>
      </Pressable>
    );
  };

  const renderPaymentModal = () => {
    if (!activePackage || paymentStep === 'idle') {
      return null;
    }

    const isProcessing = paymentStep === 'processing';
    const isResult = paymentStep === 'result' && paymentResult;
    const isSuccess = paymentResult?.status === 'success';

    return (
      <Modal
        visible
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isProcessing) {
            closePaymentFlow();
          }
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalKeyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <View style={styles.modalOverlay}>
            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View
                style={[
                  styles.modalCard,
                  {
                    backgroundColor:
                      colorScheme === 'dark' ? '#171924' : '#FFFFFF',
                  },
                ]}
              >
            {paymentStep === 'confirm' && (
              <>
                <View style={styles.modalHeaderRow}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Xác nhận thanh toán</Text>
                  <Pressable onPress={closePaymentFlow}>
                    <Ionicons name="close" size={22} color={colors.text} />
                  </Pressable>
                </View>

                <LinearGradient
                  colors={['#0E5FB3', '#0A4B8E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gatewayCard}
                >
                  <Text style={styles.gatewayLabel}>VNPAY Mock Gateway</Text>
                  <Text style={styles.gatewayAmount}>{formatPrice(activePackage.price)}</Text>
                  <Text style={styles.gatewaySubText}>{activePackage.name} • {activePackage.durationLabel}</Text>
                </LinearGradient>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Số thẻ giả (16 số)</Text>
                  <TextInput
                    value={cardNumber}
                    onChangeText={(value) => setCardNumber(sanitizeDigits(value, 16))}
                    keyboardType="number-pad"
                    maxLength={16}
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: inputBorderColor,
                      },
                    ]}
                    placeholder="VD: 9704123412341234"
                    placeholderTextColor={inputPlaceholderColor}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>CVV (3 số)</Text>
                  <TextInput
                    value={cvv}
                    onChangeText={(value) => setCvv(sanitizeDigits(value, 3))}
                    keyboardType="number-pad"
                    maxLength={3}
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: inputBorderColor,
                      },
                    ]}
                    placeholder="VD: 123"
                    placeholderTextColor={inputPlaceholderColor}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>PIN Visa giả (4 số)</Text>
                  <TextInput
                    value={pin}
                    onChangeText={(value) => setPin(sanitizeDigits(value, 4))}
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={4}
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: inputBorderColor,
                      },
                    ]}
                    placeholder="VD: 1234"
                    placeholderTextColor={inputPlaceholderColor}
                  />
                </View>

                {formError ? (
                  <Text style={styles.errorText}>{formError}</Text>
                ) : (
                  <Text style={styles.ruleHint}>
                    Demo: nhập thẻ 16 số bất kỳ, 123/1234 = Success • 9999 = Hủy • 888/8888 = Timeout
                  </Text>
                )}

                <View style={styles.modalActions}>
                  <Pressable style={styles.secondaryButton} onPress={closePaymentFlow}>
                    <Text style={styles.secondaryButtonText}>Đóng</Text>
                  </Pressable>
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => handleUpgradePlan(activePackage)}
                  >
                    <Text style={styles.primaryButtonText}>Thanh toán</Text>
                  </Pressable>
                </View>
              </>
            )}

            {isProcessing && (
              <View style={styles.processingWrap}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={[styles.processingTitle, { color: colors.text }]}>Đang xử lý giao dịch</Text>
                <Text style={styles.processingSubText}>Vui lòng chờ trong giây lát...</Text>
              </View>
            )}

            {isResult && (
              <>
                <View style={styles.resultIconWrap}>
                  <Ionicons
                    name={isSuccess ? 'checkmark-circle' : 'close-circle'}
                    size={56}
                    color={isSuccess ? '#2ECC71' : '#FF6B6B'}
                  />
                </View>
                <Text style={[styles.resultTitle, { color: colors.text }]}>
                  {isSuccess ? 'Thanh toán thành công' : 'Thanh toán chưa thành công'}
                </Text>
                <Text style={styles.resultMessage}>{paymentResult?.message}</Text>

                <View style={styles.resultMetaBox}>
                  <Text style={styles.resultMeta}>Mã GD: {paymentResult?.transactionId}</Text>
                  <Text style={styles.resultMeta}>Gói: {paymentResult?.planName}</Text>
                  <Text style={styles.resultMeta}>Số tiền: {formatPrice(paymentResult?.amount || 0)}</Text>
                  {paymentResult?.expiryDate ? (
                    <Text style={styles.resultMeta}>
                      Hết hạn: {new Date(paymentResult.expiryDate).toLocaleDateString('vi-VN')}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.modalActions}>
                  {isSuccess ? (
                    <>
                      <Pressable
                        style={styles.secondaryButton}
                        onPress={navigateToTransactionHistory}
                      >
                        <Text style={styles.secondaryButtonText}>Lịch sử GD</Text>
                      </Pressable>
                      <Pressable
                        style={styles.primaryButton}
                        onPress={finishPaymentFlow}
                      >
                        <Text style={styles.primaryButtonText}>Hoàn tất</Text>
                      </Pressable>
                    </>
                  ) : (
                    <>
                      <Pressable
                        style={styles.secondaryButton}
                        onPress={retryPayment}
                      >
                        <Text style={styles.secondaryButtonText}>Thử lại</Text>
                      </Pressable>
                      <Pressable style={styles.primaryButton} onPress={closePaymentFlow}>
                        <Text style={styles.primaryButtonText}>Đổi gói</Text>
                      </Pressable>
                    </>
                  )}
                </View>

                <Pressable
                  style={styles.historyInlineButton}
                  onPress={navigateToTransactionHistory}
                >
                  <Text style={styles.historyInlineText}>Xem lịch sử giao dịch</Text>
                </Pressable>
              </>
            )}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#0B0B0E' : colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 10,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colorScheme === 'dark' ? '#FFFFFF' : colors.text,
      flex: 1,
    },
    historyButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    subtitle: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#B8BBC6' : colors.tabIconDefault,
      fontWeight: '500',
    },
    scrollContent: {
      padding: 16,
      gap: 12,
      paddingBottom: 32,
    },
    packageCard: {
      borderRadius: 16,
      padding: 16,
      minHeight: 320,
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
      overflow: 'hidden',
    },
    popularBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      height: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    popularText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFF',
    },
    packageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 8,
    },
    packageName: {
      fontSize: 24,
      fontWeight: '700',
    },
    currentBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    currentText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FFF',
    },
    price: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 2,
    },
    duration: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 16,
    },
    featuresList: {
      gap: 10,
      marginBottom: 16,
      flex: 1,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    featureIcon: {
      minWidth: 16,
    },
    featureText: {
      fontSize: 13,
      fontWeight: '500',
      lineHeight: 18,
    },
    selectButton: {
      height: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    modalKeyboardAvoid: {
      flex: 1,
    },
    modalScrollView: {
      width: '100%',
    },
    modalScrollContent: {
      flexGrow: 1,
      justifyContent: 'flex-end',
    },
    modalCard: {
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 24,
      minHeight: 360,
      gap: 12,
    },
    modalHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
    },
    gatewayCard: {
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 4,
    },
    gatewayLabel: {
      color: 'rgba(255,255,255,0.88)',
      fontSize: 12,
      fontWeight: '600',
    },
    gatewayAmount: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '800',
    },
    gatewaySubText: {
      color: 'rgba(255,255,255,0.82)',
      fontSize: 12,
      fontWeight: '500',
    },
    inputGroup: {
      gap: 6,
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: '600',
    },
    input: {
      height: 44,
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: 12,
      fontSize: 14,
      fontWeight: '500',
      backgroundColor: 'rgba(255,255,255,0.03)',
    },
    ruleHint: {
      fontSize: 12,
      color: '#8892A4',
      lineHeight: 18,
    },
    errorText: {
      fontSize: 12,
      color: '#FF6B6B',
      fontWeight: '600',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 4,
    },
    secondaryButton: {
      flex: 1,
      height: 44,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.06)',
    },
    secondaryButtonText: {
      color: '#D7DBE4',
      fontSize: 14,
      fontWeight: '600',
    },
    primaryButton: {
      flex: 1,
      height: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#2E7CF6',
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
    processingWrap: {
      minHeight: 260,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },
    processingTitle: {
      fontSize: 18,
      fontWeight: '700',
    },
    processingSubText: {
      fontSize: 13,
      color: '#8E97A8',
      fontWeight: '500',
    },
    resultIconWrap: {
      alignItems: 'center',
      marginTop: 2,
    },
    resultTitle: {
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '700',
    },
    resultMessage: {
      textAlign: 'center',
      fontSize: 13,
      color: '#8D95A6',
      lineHeight: 18,
    },
    resultMetaBox: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
      backgroundColor: 'rgba(255,255,255,0.04)',
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 6,
    },
    resultMeta: {
      fontSize: 12,
      color: '#D6DBE6',
      fontWeight: '500',
    },
    historyInlineButton: {
      alignSelf: 'center',
      marginTop: 4,
      paddingVertical: 6,
      paddingHorizontal: 8,
    },
    historyInlineText: {
      fontSize: 12,
      color: '#8FB8FF',
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colorScheme === 'dark' ? '#FFFFFF' : colors.text}
            />
          </Pressable>
          <Text style={styles.title}>Nâng cấp VIP</Text>
          <Pressable
            style={styles.historyButton}
            onPress={goToTransactionHistory}
          >
            <Ionicons
              name="receipt-outline"
              size={20}
              color={colorScheme === 'dark' ? '#FFFFFF' : colors.text}
            />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          Chọn gói phù hợp để mở khóa các tính năng độc quyền
        </Text>
      </View>

      <FlatList
        data={VIP_PACKAGES}
        keyExtractor={(item) => item.id}
        renderItem={renderPackage}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      />

      {renderPaymentModal()}
    </SafeAreaView>
  );
};

export default PaymentPage;
