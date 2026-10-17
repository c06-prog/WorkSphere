import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

describe('App Entrypoint', () => {
  test('renders default unauthenticated shell with Login screen', async () => {
    const { getByTestId, getByText } = await render(<App />);

    expect(getByTestId('screen-login')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('SCR-AUTH-02')).toBeTruthy();
  });
});
