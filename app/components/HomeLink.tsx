import { Link } from "react-router";
import styles from "./HomeLink.module.css";

type Props = {
  useAnchor?: boolean;
};

export function HomeLink({ useAnchor }: Props) {
  if (useAnchor) {
    return (
      <a href="/" className={styles.homeLink}>
        ← Home
      </a>
    );
  }

  return (
    <Link to="/" className={styles.homeLink}>
      ← Home
    </Link>
  );
}
