import React from 'react';
import { Box, Text } from 'ink';

export function Panel({ title, borderColor = 'gray', children, marginBottom = 1, marginTop = 0, width }) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={borderColor}
      paddingX={1}
      marginBottom={marginBottom}
      marginTop={marginTop}
      width={width}
    >
      {title && (
        <Box marginBottom={1}>
          <Text color={borderColor} bold> {title} </Text>
        </Box>
      )}
      {children}
    </Box>
  );
}
