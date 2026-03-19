import React from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

interface HtmlRendererProps {
  html: string;
  baseStyle?: any;
  tagsStyles?: any;
}

export const HtmlRenderer: React.FC<HtmlRendererProps> = ({
  html,
  baseStyle = {},
  tagsStyles = {},
}) => {
  const { width } = useWindowDimensions();

  const defaultTagsStyles = {
    p: { marginBottom: 8 },
    h1: { fontSize: 24 },
    h2: { fontSize: 20 },
    h3: { fontSize: 18 },
    ul: { marginLeft: 16, marginBottom: 8 },
    ol: { marginLeft: 16, marginBottom: 8 },
    li: { marginBottom: 4 },
    a: { color: 'blue', textDecorationLine: 'underline' },
    ...tagsStyles,
  };

  return (
    <RenderHtml
      contentWidth={width}
      source={{ html }}
      baseStyle={baseStyle}
      tagsStyles={defaultTagsStyles}
    />
  );
};
