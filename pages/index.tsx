// @ts-nocheck
import axios from "axios";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import styles from "../styles/Home.module.css";

const getActivityName = (me, activityId) => {
  for (const act of me.activities) {
    if (act.id == activityId) {
      return act.name;
    }
  }
};

const trackerURL = (path) => {
  return `${process.env.NEXT_PUBLIC_TRACKER_BACKEND}${path}`;
};

function dateToDuration(s) {
  const date = Date.parse(s);
  return new Date(Date.now() - date).toISOString().slice(11, -5);
}

const Home: NextPage = () => {
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery("me", () =>
    fetch(trackerURL("/me")).then((res) => res.json())
  );

  const mutation = useMutation(
    (data) => {
      return axios.post(trackerURL("/event/end"), data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("me");
      },
    }
  );

  const [counter, setCounter] = useState(0);

  useInterval(() => {
    setCounter(counter + 1);
  }, 1000);

  if (isLoading) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  return (
    <div className={styles.container}>
      <Head>
        <title>Time Tracker</title>
        <meta name="description" content="Time Tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h2 className={styles.title}>Time Tracker</h2>

        <div>
          <p>
            Current Activity:{" "}
            {data.currentEvent
              ? getActivityName(data, data.currentEvent.id)
              : "Not Started"}{" "}
            {data.currentEvent
              ? dateToDuration(data.currentEvent.startTime)
              : ""}
          </p>
          <button
            onClick={() => {
              mutation.mutate();
            }}
          >
            End Session
          </button>
        </div>
        <p className={styles.description}></p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    let id = setInterval(() => {
      savedCallback.current();
    }, delay);
    return () => clearInterval(id);
  }, [delay]);
}
