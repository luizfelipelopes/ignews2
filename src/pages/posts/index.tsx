import { GetStaticProps } from "next";
import Head from "next/head";
import * as Prismics from "@prismicio/client";
import { RichText } from "prismic-dom";
import { getPrismicClient } from "../../services/prismic";

import styles from "./styles.module.scss";
import { arrayBuffer } from "stream/consumers";
import Link from "next/link";


// Tipa as informações de post
type Post = {
    slug: string;
    title: string;
    excerpt: string;
    updateAt: string;
}

// Tipa c/ type Post
interface PostsProps {
    posts: Post []
}

export default function Posts({ posts } : PostsProps) {
    return(
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.content}>

                    {posts.map(post => (
                        <Link href={`/posts/preview/${post.slug}`}>
                            <a key={post.slug}>
                                <time>{post.updateAt}</time>
                                <strong>{ post.title }</strong>
                                <p>{ post.title }</p>
                            </a>
                        </Link>
                    ))}
                </div>
            </main>

        </>
    );
}


export const getStaticProps : GetStaticProps = async () => {

    // Recupera service
    const prismic = getPrismicClient();

    // Recupera posts
    const response = await prismic.get({
        predicates: Prismics.predicate.at('document.type', 'post'),
        fetch: ['post.title', 'post.content'],
        pageSize: 100,
    });

    // Formata posts
    const posts = response.results.map(post => {

        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            excerpt: (post.data.content as any).find(content => content.type === 'paragraph')?.text ?? '',
            updateAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        }
    })

    return {
        props: {
            posts
        },
        revalidate: 60 * 60 * 24
    }

}