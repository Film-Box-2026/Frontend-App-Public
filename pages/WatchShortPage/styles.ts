import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingBottom: 20,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 50, // for safe area roughly
    width: '100%',
  },
  topNavGroup: {
    flexDirection: 'row',
    gap: 30,
    alignItems: 'center',
  },
  topNavText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  topNavTextActive: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  activeIndicator: {
    height: 2,
    backgroundColor: '#FFFFFF',
    width: 24,
    marginTop: 4,
    alignSelf: 'center',
    borderRadius: 2,
  },
  searchButton: {
    position: 'absolute',
    right: 16,
    top: 50,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  actionOverlay: {
    ...StyleSheet.absoluteFillObject,
    // Provide a lower z-index than the overlay so buttons are clickable,
    // or rely on natural render order.
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 80, // Space for bottom tab bar and Watch Now button
  },
  infoSection: {
    flex: 1,
    paddingRight: 60, // Avoid overlap with right actions
    gap: 8,
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  descriptionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  tagsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  actionButtons: {
    position: 'absolute',
    right: 16,
    bottom: 20, // relative to bottomSection
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  watchNowContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  watchNowButton: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  commentModalOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  commentModalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '60%',
    paddingBottom: 20,
  },
  commentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  commentModalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentListDummy: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentDummyText: {
    color: '#888',
    fontSize: 14,
  },
  commentInputRow: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    marginRight: 10,
  },
  commentSubmitBtn: {
    padding: 8,
  },
});
