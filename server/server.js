import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running fine 🚀");
});

app.listen(5000, () => console.log("Server started on port 5000"));
