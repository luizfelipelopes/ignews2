import Link from "next/link";
import { ActiveLink } from "../ActiveLink";
import { SigInButton } from "../SigInButton";
import styles from "./styles.module.scss";

export function Header () {
    return (
        <>
            <header className={styles.headerContainer}>
                <div className={styles.headerContent}>

                    <Link href='/'><a><img src="/images/logo.svg" alt="ignews" /></a></Link>

                    <nav>
                        <ActiveLink href='/' activeClassName={styles.active}>
                            <a>Home</a>
                        </ActiveLink>
                        <ActiveLink href='/posts' activeClassName={styles.active}>
                            <a>Posts</a>
                        </ActiveLink>
                    </nav>

                    <SigInButton />
                </div>
            </header>
        </>
    );
}