module.exports = {
  apps: [{
    name: "tarot",
    script: "dist-server/server/src/index.js",
    // 服务器 Node 24 独立安装在 /usr/local/node24(node:sqlite 需要),不影响系统其他 Node 20 项目
    interpreter: "/usr/local/node24/bin/node",
    env: { NODE_ENV: "production" }
  }]
};
