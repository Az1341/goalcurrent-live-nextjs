import { daysUntilPlSeasonKickoff } from "@/lib/content/pl-season-countdown-article";
import styles from "../article.module.css";

export default function PremierLeagueTwoWeeksOutBody() {
  const days = daysUntilPlSeasonKickoff();
  const timing =
    days <= 0
      ? "kicks off today"
      : days === 1
        ? "kicks off tomorrow"
        : days === 14
          ? "kicks off in exactly two weeks"
          : `kicks off in ${days} days`;

  return (
    <article className={styles.bodyCard}>
      <p>
        The FIFA World Cup 2026 is over. Spain beat Argentina 1-0 after extra
        time in the final at MetLife Stadium on 19 July, Ferran Torres settling
        it in the 106th minute to give Spain their second world title. Lionel
        Messi&apos;s last World Cup ended in defeat, England claimed bronze with a
        6-4 thriller over France, and now attention across English football has
        fully turned to domestic business. The Premier League 2026/27 season{" "}
        {timing}.
      </p>

      <h2>This Weekend: The Community Shield</h2>
      <p>
        Before a ball is kicked in the league itself, Arsenal face Manchester
        City in the Community Shield on Sunday 16 August. City qualify as FA Cup
        holders, Arsenal as Premier League champions. The match moves from its
        usual home at Wembley to the Principality Stadium in Cardiff this year —
        Wembley has a concert booked that weekend — with kick-off at 3pm.
      </p>

      <h2>Kick-Off: Arsenal vs Coventry, 21 August</h2>
      <p>
        The season proper begins on Friday 21 August, with champions Arsenal
        hosting newly promoted Coventry City at the Emirates. The full 380-fixture
        calendar was released back on 19 June. The whole campaign starts and
        finishes a week later than usual this year, giving players and clubs
        extra recovery time after the expanded World Cup — the final matchday
        falls on 30 May 2027, with every game kicking off simultaneously as is
        tradition.
      </p>
      <p>
        Three clubs return to the top flight this season: Coventry City, Hull
        City and Ipswich Town, replacing relegated Burnley, Wolves and West Ham.
      </p>

      <h2>The Transfer Window: Chelsea&apos;s Big Summer</h2>
      <p>
        The summer transfer window opened on 15 June and closes on 1 September.
        Chelsea have been the standout spenders of the window so far, bringing
        in Morgan Rogers, Maxence Lacroix, Marco Palestra, Danny Welbeck,
        Valentin Barco and Jordan Henderson as Xabi Alonso begins his first
        season in charge at Stamford Bridge.
      </p>
      <p>
        Elsewhere, Newcastle United completed a club-record sale to Barcelona
        worth over £69m, Manchester United sold a player to Napoli for £38m, and
        Aston Villa banked £21.6m from a departure to Roma. Arsenal have been
        strongly linked with Real Madrid&apos;s Vinicius Junior, though as of early
        August, Real Madrid appear close to tying him down to a new contract
        instead — one of several deals still very much unresolved with three
        weeks left in the window.
      </p>

      <h2>What to Watch For</h2>
      <p>
        With the World Cup finally behind them, England&apos;s returning stars —
        Bukayo Saka, Declan Rice, Jude Bellingham and others who went deep into
        the tournament — face a compressed pre-season before their clubs need
        them fit for August. How well each manager balances that fatigue against
        the demands of an opening month could shape the early table as much as
        any transfer business. The wait is nearly over.
      </p>
    </article>
  );
}