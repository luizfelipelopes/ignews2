import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next";
import * as Prismics from "@prismicio/client"
import { getPrismicClient } from "../../../services/prismic";
import { RichText } from "prismic-dom";

import styles from "../post.module.scss";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

type Post = {
    slug: string;
    title: string;
    content: string;
    updateAt: string;
}

interface PostPreviewProps {
    post: Post
}

export default function PostPreview({ post }: PostPreviewProps){

    const {data: session} = useSession();
    const router = useRouter();

    useEffect (() => {
        if(session?.activeSubscription) {
            router.push(`/posts/${post.slug}`);
            return;
        }
    }, [session]);

    return(
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>
            <article className={styles.container}>
                <div className={styles.content}>
                    <h1>{post.title}</h1>
                    <time>{post.updateAt}</time>
                    <div
                    className={`${styles.postContent} ${styles.previewContent}`}
                    dangerouslySetInnerHTML={{__html:post.content}} />
                    {/* <p> {post.content} </p> */}

                    <div className={styles.continueReading}>
                        Wanna continue reading ?
                        <Link href='/'>
                            <a> Subscribe Now 🤗</a>
                        </Link>
                    </div>
                </div>
            </article>
        </>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {

    const { slug } = params;

    const prismic = getPrismicClient();

    const response = await prismic.getByUID('post', String(slug), {});

    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml((response.data.content as any).slice(0, 1)),
        updateAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    console.log(post);

    return {
        props: {
            post
        },
        revalidate: 60 * 30 // 30 minutes
    }
};