const http = require("http");

// Test 1: Login
const loginBody = JSON.stringify({ email: "admin@gangatv.com", password: "admin123" });

const loginReq = http.request(
  {
    hostname: "localhost",
    port: 8080,
    path: "/api/auth/login",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(loginBody),
    },
  },
  (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      const parsed = JSON.parse(data);
      console.log("=== LOGIN TEST ===");
      console.log("Status:", res.statusCode);
      console.log("Success:", parsed.success);
      console.log("Has token:", !!parsed.token);
      console.log("User name:", parsed.user?.name);
      console.log("User role:", parsed.user?.role);

      if (!parsed.token) {
        console.log("FAIL: No token returned");
        return;
      }

      // Test 2: Use token to access /api/auth/me
      const meReq = http.request(
        {
          hostname: "localhost",
          port: 8080,
          path: "/api/auth/me",
          method: "GET",
          headers: {
            Authorization: `Bearer ${parsed.token}`,
          },
        },
        (meRes) => {
          let meData = "";
          meRes.on("data", (chunk) => (meData += chunk));
          meRes.on("end", () => {
            const meParsed = JSON.parse(meData);
            console.log("\n=== ME (Bearer Token) TEST ===");
            console.log("Status:", meRes.statusCode);
            console.log("Success:", meParsed.success);
            console.log("User name:", meParsed.user?.name);
            console.log("Result:", meParsed.success ? "PASS ✅" : "FAIL ❌");

            // Test 3: Get settings
            const settingsReq = http.request(
              {
                hostname: "localhost",
                port: 8080,
                path: "/api/settings",
                method: "GET",
              },
              (sRes) => {
                let sData = "";
                sRes.on("data", (chunk) => (sData += chunk));
                sRes.on("end", () => {
                  const sParsed = JSON.parse(sData);
                  console.log("\n=== SETTINGS TEST ===");
                  console.log("Status:", sRes.statusCode);
                  console.log("Success:", sParsed.success);
                  console.log("Has data:", !!sParsed.data);
                  console.log("Result:", sParsed.success ? "PASS ✅" : "FAIL ❌");

                  // Test 4: Get news by category with token
                  const catReq = http.request(
                    {
                      hostname: "localhost",
                      port: 8080,
                      path: "/api/news/category/sports",
                      method: "GET",
                    },
                    (catRes) => {
                      let catData = "";
                      catRes.on("data", (chunk) => (catData += chunk));
                      catRes.on("end", () => {
                        const catParsed = JSON.parse(catData);
                        console.log("\n=== NEWS BY CATEGORY (sports) TEST ===");
                        console.log("Status:", catRes.statusCode);
                        console.log("Success:", catParsed.success);
                        console.log("Count:", catParsed.count);
                        console.log("Result:", catParsed.success ? "PASS ✅" : "FAIL ❌");

                        console.log("\n=== ALL TESTS COMPLETE ===");
                      });
                    }
                  );
                  catReq.end();
                });
              }
            );
            settingsReq.end();
          });
        }
      );
      meReq.end();
    });
  }
);

loginReq.write(loginBody);
loginReq.end();
