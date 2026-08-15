import { app } from "./app.ts";

const PORT = process.env.BACKEND_PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend Express Auth Server running at http://localhost:${PORT}`);
});
