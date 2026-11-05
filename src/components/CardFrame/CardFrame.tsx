import styles from "./CardFrame.module.css";

interface CardFrameProps {
  name: string;
  image: string | null;
  rarity: string;
}

export default function CardFrame({
  name,
  image,
  rarity
}: CardFrameProps) {

  const rarityClass = rarity.toUpperCase();

  const cardImage =
    image && image.trim() !== ""
      ? image
      : "/cards/default.jpg";

  return (
    <div className={`${styles.card} ${styles[rarityClass]}`}>

      <div className={styles.glow}></div>

      <img
        src={cardImage}
        alt={name}
        className={styles.image}
      />

      <h3 className={styles.name}>
        {name}
      </h3>

    </div>
  );
}