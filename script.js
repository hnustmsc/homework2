// 当前登录用户
let currentUser = null;

// 微博数据列表
let weibos = [];

// 用户数据库（支持注册和登录）
let users = JSON.parse(localStorage.getItem("weibo_users")) || ["Alice", "Bob", "Charlie"];

// 显示注册界面
function showRegister() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("register-section").style.display = "block";
}

// 返回登录界面
function backToLogin() {
    document.getElementById("register-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
}

// 登录逻辑
function login() {
    const input = document.getElementById("username");
    const name = input.value.trim();

    if (users.includes(name)) {
        currentUser = name;
        document.getElementById("login-section").style.display = "none";
        document.getElementById("register-section").style.display = "none";
        document.getElementById("post-section").style.display = "block";
        loadWeibos(); // 加载已有的微博
    } else {
        alert("用户名不存在，请检查拼写或注册新账号。");
    }
}

// 注册逻辑
function handleRegister() {
    const input = document.getElementById("new-username");
    const name = input.value.trim();

    if (!name) {
        alert("用户名不能为空！");
        return;
    }

    if (users.includes(name)) {
        alert("该用户名已被占用，请换一个！");
        return;
    }

    users.push(name);
    localStorage.setItem("weibo_users", JSON.stringify(users)); // 持久化保存用户列表
    alert("注册成功！请登录");
    input.value = "";
    backToLogin();
}

// 发布微博
function postWeibo() {
    const content = document.getElementById("post-content").value.trim();
    const fileInput = document.getElementById("post-image");
    const file = fileInput.files[0];

    if (!content && !file) {
        alert("请输入内容或选择图片！");
        return;
    }

    const reader = new FileReader();
    reader.onload = function () {
        const imageUrl = reader.result;

        const newPost = {
            id: Date.now(),
            user: currentUser,
            content: content,
            image: imageUrl,
            likes: 0,
            comments: []
        };

        weibos.unshift(newPost);
        saveWeibos();
        renderFeed();
    };

    if (file) {
        reader.readAsDataURL(file);
    } else {
        const newPost = {
            id: Date.now(),
            user: currentUser,
            content: content,
            image: null,
            likes: 0,
            comments: []
        };
        weibos.unshift(newPost);
        saveWeibos();
        renderFeed();
    }

    document.getElementById("post-content").value = "";
    fileInput.value = "";
}

// 存储微博数据到 localStorage
function saveWeibos() {
    localStorage.setItem("weibo_posts", JSON.stringify(weibos));
}

// 从 localStorage 加载微博数据
function loadWeibos() {
    const data = localStorage.getItem("weibo_posts");
    if (data) {
        weibos = JSON.parse(data);
    }
    renderFeed();
}

// 渲染微博动态流
function renderFeed() {
    const feed = document.getElementById("feed");
    feed.innerHTML = "";

    weibos.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.className = "post";

        // 用户名和内容
        postDiv.innerHTML = `<strong>${post.user}</strong>:<br>${post.content || ""}`;

        // 图片
        if (post.image) {
            const img = document.createElement("img");
            img.src = post.image;
            img.alt = "微博图片";
            img.style.maxWidth = "100%";
            img.style.borderRadius = "8px";
            img.style.marginTop = "10px";
            postDiv.appendChild(img);
        }

        // 点赞按钮
        const likeBtn = document.createElement("button");
        likeBtn.innerText = `👍 赞 (${post.likes})`;
        likeBtn.onclick = () => {
            post.likes++;
            saveWeibos();
            renderFeed();
        };

        // 评论输入框
        const commentInput = document.createElement("input");
        commentInput.placeholder = "添加评论...";
        commentInput.style.marginTop = "10px";
        commentInput.style.width = "calc(100% - 80px)";
        commentInput.style.padding = "5px";

        const commentBtn = document.createElement("button");
        commentBtn.innerText = "评论";
        commentBtn.onclick = () => {
            const commentText = commentInput.value.trim();
            if (commentText) {
                post.comments.push({ user: currentUser, text: commentText });
                commentInput.value = "";
                saveWeibos();
                renderFeed();
            }
        };

        // 渲染评论
        const commentsDiv = document.createElement("div");
        commentsDiv.className = "comments";
        post.comments.forEach(cmt => {
            const cmtEl = document.createElement("div");
            cmtEl.innerHTML = `<strong>${cmt.user}</strong>: ${cmt.text}`;
            commentsDiv.appendChild(cmtEl);
        });

        postDiv.appendChild(likeBtn);
        postDiv.appendChild(document.createElement("br"));
        postDiv.appendChild(commentInput);
        postDiv.appendChild(commentBtn);
        postDiv.appendChild(commentsDiv);

        feed.appendChild(postDiv);
    });
}

// 退出登录
function logout() {
    if (confirm("确定要退出登录吗？")) {
        currentUser = null;
        document.getElementById("post-section").style.display = "none";
        document.getElementById("login-section").style.display = "block";
        document.getElementById("username").value = ""; // 清空用户名输入框
    }
}