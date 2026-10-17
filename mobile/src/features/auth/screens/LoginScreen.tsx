import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PlaceholderScreen } from '../../../shared/components/PlaceholderScreen';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import type { AuthNavigationProp } from '../../../app/navigation/types';

export function LoginScreen() {
  const navigation = useNavigation<AuthNavigationProp<'Login'>>();
  const theme = useAppTheme();

  return (
    <PlaceholderScreen
      title="Login"
      screenId="SCR-AUTH-02"
      subtitle="SCR-AUTH-02: Authentication Login Screen (Phase 12 Shell)"
      testID="screen-login"
    >
      <View style={styles.actionContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to Forgot Password"
          testID="btn-to-forgot-password"
          onPress={() => navigation.navigate('ForgotPassword')}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radii.medium,
              paddingVertical: theme.spacing.sm,
              paddingHorizontal: theme.spacing.md,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={[theme.typography.label, styles.buttonText, { color: theme.colors.onPrimary }]}>
            Forgot Password?
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
