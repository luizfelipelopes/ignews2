
import { useState } from "react";
import {FaGithub} from "react-icons/fa";
import { FiX } from "react-icons/fi";
import styles from "./styles.module.scss";


export function SigInButton() {

    const [session, setSession] = useState(false);

    return session ? (
        <button
        type="button"
        className={styles.sigInButton}
        onClick={() => setSession(false)}>
            <FaGithub color="#04d361" />
            Luiz Felipe
            <FiX color="#737380" className={styles.closeIcon} />
        </button>
    ):
    (
        <button
        type="button"
        className={styles.sigInButton}
        onClick={() => setSession(true)}>
            <FaGithub color="#EBA417" />
            Sing in With Github
        </button>

    )
    ;
}