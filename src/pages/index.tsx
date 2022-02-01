import { GetStaticProps } from "next";
import Head from "next/head"
import { SubscribeButton } from "../Components/SubscribeButton";
import { stripe } from "../services/stripe";

import styles from "./home.module.scss";

interface HomeProps {
  product : {
    priceId: string;
    amount: number;
  }
}

export default function Home({ product } : HomeProps) {
  return (
    <>
        <Head>
          <title>Home | Ignews</title>
        </Head>

        <main className={styles.contentContainer}>
          <section className={styles.hero}>
            <span>👏 Hey, welcome</span>

            <h1>News about the <span>React</span> world</h1>

            <p>Get acess to all the publications <br />
            <span>for {product.amount} month</span></p>

            <SubscribeButton priceId={product.priceId} />
          </section>

          <img src="./images/avatar.svg" alt="Girl Coding" />

        </main>

    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  // recuperar o produto pelo service stripe.ts
  const price = await stripe.prices.retrieve('price_1KJaoxKHMVZBEmtpn0w3cbpx', {
    expand: ['product']
  });

  // Formatar as informações de produto necessárias
  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price.unit_amount / 100)
  }

  // retorna a propriedade do produto
  return {
      props: {
        product,
      },

      revalidate: 60 * 60 * 24 //24 hours
  }

};
