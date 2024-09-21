/** @jsxImportSource frog/jsx */

import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/vercel";
import { serveStatic } from "frog/serve-static";
import { pinata } from "frog/hubs";
import { neynar } from "frog/middlewares";

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY ?? "";

type State = {
  yesVotes: number;
  noVotes: number;
  votedFids: number[];
};

const app = new Frog<{ State: State }>({
  assetsPath: "/",
  basePath: "/api",
  title: "There will be over 10,000 Kramer predictions before 9/29 midnight",
  initialState: {
    yesVotes: 0,
    noVotes: 0,
    votedFids: [],
  },
  hub: pinata(),
}).use(
  neynar({
    apiKey: NEYNAR_API_KEY,
    features: ["interactor", "cast"],
  })
);

app.frame("/", (c) => {
  const { buttonValue, status, deriveState, verified } = c;
  const fid = c.var?.interactor?.fid;
  const hasVoted = c.previousState.votedFids.includes(fid);

  if (hasVoted) {
    return c.res({
      image: "/verified",
      intents: [
        <Button value="viewVotes" action="/viewVotes">
          View Votes
        </Button>,
      ],
    });
  }

  deriveState((previousState) => {
    if (buttonValue === "yes") previousState.yesVotes += 1;
    if (buttonValue === "no") previousState.noVotes += 1;

    if (fid && !previousState.votedFids.includes(fid)) {
      previousState.votedFids.push(fid);
    }

    return previousState;
  });

  if (status === "response") {
    return c.res({
      image: "/viewVotes",
    });
  } else {
    return c.res({
      image: "/vote",
      intents: [
        <Button value="yes">Yes</Button>,
        <Button value="no">No</Button>,
      ],
    });
  }
});

app.image("/viewVotes", (c) => {
  const state = c.previousState;

  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#000",
            padding: "0 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "white",
            fontSize: 35,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
          }}
        >
          <p>
            There will be over 10,000 Kramer predictions before 9/29 midnight.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 0,
            }}
          >
            <p>Positions</p>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: 240,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  marginTop: "0",
                }}
              >
                <p>Yes</p>
                <span>{state.yesVotes}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  marginTop: "0",
                }}
              >
                <p>No</p>
                <span>{state.noVotes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  });
});

app.image("/verified", (c) => {
  return c.res({
    image: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <img
          src="/assets/background.jpeg"
          width={100}
          height={100}
          style={{
            position: "relative",
            objectFit: "cover",
            width: "100%",
            height: "100%",
          }}
        />
        <div
          style={{
            padding: "0 60px",
            position: "absolute",
            background: "rgba(0, 0, 0, .8)",
            width: "60%",
            height: "45%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "white",
              fontSize: 35,
              fontStyle: "normal",
              letterSpacing: "-0.025em",
              lineHeight: 1.4,
            }}
          >
            You already voted.
          </p>
        </div>
      </div>
    ),
  });
});

app.image("/vote", (c) => {
  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <img
          src="/assets/background.jpeg"
          width={100}
          height={100}
          style={{
            position: "relative",
            objectFit: "cover",
            width: "100%",
            height: "100%",
          }}
        />
        <div
          style={{
            padding: "0 60px",
            position: "absolute",
            background: "rgba(0, 0, 0, .8)",
            width: "60%",
            height: "45%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "white",
              fontSize: 35,
              fontStyle: "normal",
              letterSpacing: "-0.025em",
              lineHeight: 1.4,
            }}
          >
            There will be over 10,000 Kramer predictions before 9/29 midnight.
          </p>
        </div>
      </div>
    ),
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
