import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PlaceholderScreen } from '../../../shared/components/PlaceholderScreen';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import type { AuthNavigationProp } from '../../../app/navigation/types';

export function ResetPasswordScreen() {
  const navigation = useNavigation<AuthNavigationProp<'ResetPassword'>>();
  const theme = useAppTheme();

  return (
    <PlaceholderScreen
      title="Reset Password"
      screenId="SCR-AUTH-04"
      subtitle="SCR-AUTH-04: Reset Password Screen (Phase 12 Shell)"
      testID="screen-reset-password"
    >
      <View style={styles.actionContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Login"
          testID="btn-back-to-login-from-reset"
          onPress={() => navigation.navigate('Login')}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: theme.radii.medium,
              borderColor: theme.colors.border,
              borderWidth: 1,
              paddingVertical: theme.spacing.sm,
              paddingHorizontal: theme.spacing.md,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={[theme.typography.label, styles.buttonText, { color: theme.colors.textPrimary }]}>
            Back to Login
          </Text>
        </Pressable>
      </View>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    marginTop: 16,
  },
  button: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    textAlign: 'center',
  },
});
