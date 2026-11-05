export function getWinRate(
    wins = 0,
    losses = 0
){
    const total = wins + losses;

    if(total <= 0){
        return 0;
    }

    return Math.round(
        (wins / total) * 100
    );
}