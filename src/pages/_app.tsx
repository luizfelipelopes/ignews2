import { Header } from '../Components/Header';
import '../styles/global.scss';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  )
}
