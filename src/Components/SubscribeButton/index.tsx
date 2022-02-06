import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "../../services/api";
import { getStripeJs } from "../../services/stripe.js";
import styles from "./styles.module.scss";

interface SubscribeButtonProps {
    priceId: string;
}

export function SubscribeButton({ priceId } : SubscribeButtonProps) {


    const { data: session } = useSession();
    const router = useRouter();

    async function handleSubscribe() {

        console.log(session);

        if(!session){
            signIn('github');
            return;
        }

        if(session?.activeSubscription) {
            router.push('/posts');
            return;
        }

        try {

            // stripe agindo no back-end
            const response = await api.post('/subscribe');
            const { sessionId } = response.data;

            // stripe agindo no font-end (redirecionamento)
            const stripe = await getStripeJs();
            await stripe.redirectToCheckout({ sessionId });

        } catch (error) {
            alert(error.message);
        }

    }

    return (
        <>
            <button
            className={styles.subscribeButton}
            type="button"
            onClick={() => handleSubscribe()}>
                Subscribe now
            </button>
        </>
    );
}