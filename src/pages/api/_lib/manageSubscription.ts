import { query as q } from "faunadb";
import { fauna } from "../../../services/fauna";
import { stripe } from "../../../services/stripe";

export async function saveSubscription (
subscriptionId: string,
customerId: string,
createAction = false
) {

    // Buscar ref do usuario
    const userRef = await fauna.query(
        q.Select(
            "ref",
            q.Get(
                q.Match(
                    q.Index('user_by_stripe_customer_id'),
                    customerId
                )
            )
        )
    );

    // recupera informações de subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Recupera dados essenciais para inserir em subscription
    const subscriptionData = {
        id: subscription.id,
        ref: userRef,
        status: subscription.status,
        price: subscription.items.data[0].price.id
    }

    if(createAction) { // Cria subscription

        // Cria registro em subscriptions
        await fauna.query(
            q.Create(
                q.Collection('subscriptions'),
                { data: subscriptionData }
            )
        )
    } else { // Atualiza subscription

        await fauna.query(
            q.Replace(
                q.Select(
                    "ref",
                    q.Get(
                        q.Match(
                            q.Index('subscription_by_id'),
                            subscriptionId
                        )
                    )
                ),
                { data: subscriptionData }
            )
        )
    }

}