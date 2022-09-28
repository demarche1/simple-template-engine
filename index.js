import http from "http";
import View from "./core/View.js";

const handler = async (req, res) => {
  const v = new View();
  
  if(req.url === "/profile") {
    const profilePage = await v.render("profile.html", { 
      name: "Zezin", 
      profile: { 
        age: 24 
      }, 
      content: "Hello World" , 
      skills: ["js", "html", "css"]
    });

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(profilePage);
    return
  }

  const homePage = await v.render("index.html", {
    content: "Hello World",
  })

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(homePage);
};

http.createServer(handler).listen(3000, () => {
  console.log("Server listening on port 3000");
});
