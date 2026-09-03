const express = require("express");

const app = express();
const BASE = (process.env.MEDIA_BASE || "https://media.vidrift.in").replace(/\/+$/, "");

// CORS + cache
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Cache-Control", "s-maxage=86400");
  next();
});

const pad = (n) => String(n).padStart(2, "0");

const router = express.Router();

// GET /api/tv/1396/1/1  ->  https://media.vidrift.in/tv_1396/Season%201/S01E01/vod.m3u8
router.get("/tv/:id/:season/:episode", (req, res) => {
  const { id, season, episode } = req.params;
  const url = `${BASE}/tv_${id}/${encodeURIComponent("Season " + season)}/S${pad(season)}E${pad(episode)}/vod.m3u8`;
  if (req.query.redirect) return res.redirect(302, url);
  res.json({ url });
});

// GET /api/movie/550  ->  https://media.vidrift.in/movie_550/vod.m3u8
router.get("/movie/:id", (req, res) => {
  const url = `${BASE}/movie_${req.params.id}/vod.m3u8`;
  if (req.query.redirect) return res.redirect(302, url);
  res.json({ url });
});

// mounted at both / and /api so it works self-hosted AND on Vercel
app.use("/", router);
app.use("/api", router);

// health/status
app.get("/", (req, res) =>
  res.json({
    status: "ok",
    endpoints: {
      tv: "/api/tv/:id/:season/:episode",
      movie: "/api/movie/:id",
    },
    tip: "add ?redirect=1 to 302 straight to the .m3u8",
  })
);

module.exports = app;
