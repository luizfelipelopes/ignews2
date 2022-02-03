import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { fauna } from "../../services/fauna";
import { query as q } from "faunadb";
import { stripe } from "../../services/stripe";

type User = {

    ref: {
        id: string;
    }

    data : {
        stripe_customer_id: string;
    }
}


export default async (req: NextApiRequest, res: NextApiResponse) => {


    // verificar se é um metodo POST

    if(req.method === 'POST') {


        // recuperar a session atual

        const session = await getSession({ req });


        // buscar no faunadb o usuario pelo email da session

        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email)
                )
            )
        )

        // verificar se possui o id de customer do stripe

        let customerId = user.data.stripe_customer_id;


        //senao tiver:
        if(!customerId) {

            //cadastra no stripe
            const stripeCustomer = await stripe.customers.create({
                email: session.user.email
            });

            //atualiza o usuario com id de customer no faunadb

            await fauna.query(
                q.Update(
                    q.Ref(q.Collection('users'), user.ref.id),
                    {
                        data: { stripe_customer_id: stripeCustomer.id}
                    }
                )
            )

           customerId = stripeCustomer.id;
        }


        // cria checkout session

        const stripeCheckoutSession = await stripe.checkout.sessions.create({

            customer: customerId,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [
                {price: 'price_1KJaoxKHMVZBEmtpn0w3cbpx', quantity: 1}
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL

        });

        //retorno id do checkout session com codigo 200

        return res.status(200).json({ sessionId: stripeCheckoutSession.id })

    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method not allowed')
    }








}