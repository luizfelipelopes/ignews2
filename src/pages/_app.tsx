import { SessionProvider } from 'next-auth/react';
import { Header } from '../Components/Header';
import '../styles/global.scss';

export default function MyApp({ Component, pageProps }) {
  return (
    // Pove session para todos os usuarios
    <SessionProvider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
    </SessionProvider>
  )
}
