import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from 'stream';
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";


// Conversão de formato de Streaming para conseguir recuperar a requisição
// Webhooks do stripe estão no formato de streaming
async function buffer(readable: Readable) {
    const chunks = [];

    for await (const chunk of readable) {
        chunks.push(
            typeof chunk === "string" ? Buffer.from(chunk) : chunk
        );
    }

    return Buffer.concat(chunks);
}

// Desabilita o entendimento padrão de recebimento de requisição do next (json ou envio de forms)
// Para que possa receber reuisião no formato Stream
export const config = {
    api: {
        bodyParser: false
    }
}

// Cria o set de eventos relevantes que
// serão monitorados no Webhook
const relevantEvents = new Set([
    'checkout.session.completed',
    'customer.subscription.update',
    'customer.subscription.deleted',
]);

export default async (req: NextApiRequest, res: NextApiResponse) => {

    if(req.method === 'POST') {

        const buf = await buffer(req); // recupera os streamings concatenados da requisição

        const secret = req.headers['stripe-signature']; // recupera assinatura do header da requisicao

        let event: Stripe.Event; // Cria variavel do tipo Stripe.Event

        try {
            // Recupera eventos passando como parametro
            // requisição, secret do header, secret do CLI
            event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (error) {
            // retorna error caso deu problema na criação do evento
            res.status(405).send(`Webhook error: ${error.message}`);
        }

        // Tipos de eventos exibidos no CLI
        const { type } = event;


        // Se o tipo de evento estiver entre os eventos relevantes
        // para aplicação
        if(relevantEvents.has(type)){

            try {

                switch (type) {

                    case 'customer.subscription.created':
                    case 'customer.subscription.update':
                    case 'customer.subscription.deleted':

                        const subscription = event.data.object as Stripe.Subscription;

                        saveSubscription(
                            subscription.id,
                            subscription.customer.toString(),
                            type === 'customer.subscription.created'
                        )

                    break;


                    case 'checkout.session.completed':

                    const checkoutSession = event.data.object as Stripe.Checkout.Session
                        saveSubscription(
                            checkoutSession.subscription.toString(),
                            checkoutSession.customer.toString(),
                            true);
                        break;

                    default:
                        throw new Error("Unhandled event.");
                        break;
                }

            } catch (error) {
                res.json({error: 'Webhook handler failed'});
            }
        }

        res.json({ received: true });

    }else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method not allowed')
    }

};