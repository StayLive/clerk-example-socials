import React, { useState } from 'react';
import './App.css';
import { useSignIn, ClerkProvider, ClerkLoaded } from '@clerk/clerk-react';

const SocialConnections = () => {
  const { signIn } = useSignIn();

  const activatedSocialConnections = signIn?.supportedFirstFactors?.filter(
    (s) => s.strategy !== 'ticket' && s.strategy !== 'password'
  );

  if (!activatedSocialConnections?.length) {
    return (
      <div className='text-black'>
        Clicking this button to go to Google and then just go back to this page brings them all back?
        <br />
        <SignInWithOAuth provider='oauth_google' />
        <br />
        <br />
        No social connections activated. Please activate at least one social.
        <pre>{JSON.stringify(signIn, null, 4)}</pre>
      </div>
    );
  }

  return (
    <div className='grid items-center justify-center w-full grid-cols-1 gap-2 pb-2 md:grid-cols-2'>
      Social connections activated:
      <br />
      {activatedSocialConnections.map((connection) => (
        <SignInWithOAuth key={connection.strategy} provider={connection.strategy} />
      ))}
    </div>
  );
};

const SignInWithOAuth = ({ provider = 'oauth_google' }) => {
  const { signIn } = useSignIn({
    strategy: provider,
  });
  const [imageHidden, setImageHidden] = useState(false);

  const onPress = React.useCallback(async () => {
    try {
      signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: `${window.location.href}${window.location.search}`,
      });
    } catch (err) {
      console.error('OAuth error', err);
    }
  }, [provider, signIn]);

  const providerImageUrl = `https://img.clerk.com/static/${provider.replace('oauth_', '')}.svg?width=160`;

  return (
    <button
      onClick={onPress}
      type='button'
      className='w-full py-2 pl-4 text-left text-black bg-white border border-gray-400 rounded-md cursor-pointer group hover:bg-gray-100 hover:border-gray-500'
    >
      <div className='relative flex flex-row items-center justify-start w-full text-left'>
        {!imageHidden && (
          <img
            src={providerImageUrl}
            width='20'
            height='20'
            onError={() => {
              setImageHidden(true);
            }}
            alt={provider
              .replace('oauth_', '')
              // first case uppercase
              .replace(/^\w/, (c) => c.toUpperCase())}
          />
        )}
        <span className='ml-2 font-bold'>Sign in with {provider}</span>
      </div>
    </button>
  );
};

function App() {
  return (
    <ClerkProvider
      publishableKey='INSERT_CLERK_TOKEN_HERE'
      afterSignInUrl={`${window.location.pathname}${window.location.search || ''}`}
      afterSignUpUrl={`${window.location.pathname}${window.location.search || ''}`}
      afterSignOutUrl={`${window.location.pathname}${window.location.search || ''}`}
    >
      <ClerkLoaded>
        <div className='App'>
          <header className='App-header'>
            <p>Example of Clerk Sign in.</p>
            <SocialConnections />
          </header>
        </div>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

export default App;
