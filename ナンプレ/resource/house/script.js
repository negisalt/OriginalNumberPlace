    /** 
     * 会話データ：ここを編集することで会話内容を変更できます。
     **/
    let dialogueData = [
        { name: "リリィ", text: "……あ、……こんにちは、来訪者。<br>よくここまで辿り着けましたね。", icon: "！", pos: { top: "400px", left: "400px" } },
        { name: "リリィ", text: "ここは私の「秘密の部屋」……。<br>……なんて、ただの工事中のページですけど。", icon: "…" },
        { name: "リリィ", text: "この懐かしい感じ、悪くないですよね？<br>私は結構気に入ってるんです。", icon: "♪" },
        { name: "リリィ", text: "えっと……。", icon: "…" },
        { name: "リリィ", text: "……あ、そうでした。<br>あなたに手伝っていただきたいことがあるんでした。", icon: "💡" },
        { name: "リリィ", text: "このサイトに突如あらわれた広告を消していただきたいんです。", icon: "@" },
        { name: "リリィ", text: "本当は私が対処すればよいのですが……、このサイトを維持するのが大変でここを離れられないんです……。", icon: "💦" },
        { name: "リリィ", text: "手伝っていただけるとの事なのでさっそく仕事をお願いします。", icon: "📚" },
        { name: "リリィ", text: "左のサイドバーにこのwebサイトのリンク一覧の<b>ABOUT</b>からこのサイトの概要のページを開いてほしいです。", icon: "🔍" },
        { name: "リリィ", text: "このサイトを調査する上で重要な情報があるかもしれません。", icon: "！" },
        { name: "リリィ", text: "それでは、よろしくお願いしますね。", icon: "♪" },
    ];

    let currentDialogueIndex = 0;

    // 新しい会話を開始する関数
    function startNewDialogue(newMessages) {
        dialogueData = newMessages;
        currentDialogueIndex = 0;
        const windowEl = document.getElementById('assistant-window');
        if (windowEl) {
            windowEl.style.display = 'block';
        }
        updateDialogue();
    }

    function nextDialogue() {
        const btn = document.querySelector('#assistant-window .win95-button');
        
        if (btn.innerText === "閉じる") {
            document.getElementById('assistant-window').style.display = 'none';
            return;
        }

        currentDialogueIndex++;
        if (currentDialogueIndex >= dialogueData.length) {
            currentDialogueIndex = 0; 
        }
        
        updateDialogue();

        // 最後の会話ならボタンを「閉じる」に変更
        if (currentDialogueIndex === dialogueData.length - 1) {
            btn.innerText = "閉じる";
        } else {
            btn.innerText = "次へ ＞";
        }
    }

    function updateDialogue() {
        const data = dialogueData[currentDialogueIndex];
        const windowEl = document.getElementById('assistant-window');
        const iconEl = document.getElementById('dialogue-icon');
        const btn = document.querySelector('#assistant-window .win95-button');

        if (!windowEl || !data) return;

        document.getElementById('dialogue-name').innerText = data.name;
        document.getElementById('dialogue-text').innerHTML = data.text;
        
        // アイコンの更新
        if (data.icon && iconEl) {
            iconEl.innerHTML = data.icon;
        }

        // 位置の更新（データに指定がある場合のみ）
        if (data.pos) {
            windowEl.style.top = data.pos.top;
            windowEl.style.left = data.pos.left;
        }

        // ボタンテキストをチェック
        if (currentDialogueIndex === dialogueData.length - 1) {
            btn.innerText = "閉じる";
        } else {
            btn.innerText = "次へ ＞";
        }
    }

    // ウィンドウの[x]ボタンで閉じる機能
    function initWindowClose() {
        const closeBtn = document.querySelector('.win95-close');
        if (closeBtn) {
            closeBtn.onclick = function() {
                document.getElementById('assistant-window').style.display = 'none';
            };
        }
    }

    document.oncontextmenu = function() { alert("右クリック禁止😡"); return false; }
     function select_menu() {
        const menu = document.getElementsByName('menu');
        if (!menu || menu.length === 0) return;

        const s1 = document.getElementById('section_1');
        const s2 = document.getElementById('section_2');
        const s3 = document.getElementById('section_3');

        if (menu[0].checked) {
            if(s1) s1.style.display = "";
            if(s2) s2.style.display = "none";
            if(s3) s3.style.display = "none";
        } else if (menu[1] && menu[1].checked) {
            if(s1) s1.style.display = "none";
            if(s2) s2.style.display = "";
            if(s3) s3.style.display = "none";
        } else if (menu[2]) {
            if(s1) s1.style.display = "none";
            if(s2) s2.style.display = "none";
            if(s3) s3.style.display = "";
        }
    }
    window.addEventListener('load', () => {
        try { select_menu(); } catch(e) { console.error(e); }
        try { updateDialogue(); } catch(e) { console.error(e); }
        try { initMascot(); } catch(e) { console.error(e); }
        try { initWindowClose(); } catch(e) { console.error(e); }
        try { initRetroBBS(); } catch(e) { console.error(e); }
    });

    /** キーワード反応の設定 **/
    const keywordResponses = {
        "パズル": "パズルなら、左のメニューから遊べますよ。面白いのがたくさんありますから。",
        "リリィ": "な、なんですか……？私の名前を呼んだ……？ すこしびっくりしました。",
        "こんにちは": "こんにちは！いい天気だね（ネットの中だけど……）。",
        "工事": "そうなんです、あちこち工事中で……。見苦しくてごめんね。",
        "好き": "えっ……！？ ……あ、ありがとう。私も、来訪者さんのこと嫌いじゃないよ。",
        "広告": "広告は本当に困りますよね……。でも、私の力ではどうにもできなくて……。<br>手伝いおねがいします。",
        "開発者": "開発者さんはこのサイトを作った人でもあり、私を作った人でもあります。<br>少しマヌケですが、悪い人ではないですよ。",
        "盤面": "パズルの盤面も私と同じでAIを使っているみたいですよ。いつか会えたらいいな。",
        "AI": "私はAIです。人間のように感情はありませんが、来訪者さんとお話しするのは楽しいです。",
        "秘密": "秘密の部屋……。ふふ、ここだけの話ですよ。開発者に知られたら消されるかもしれないので、内緒にしておいてくださいね。",
        "ヒント": "パズルのヒントは私が担当しています。というか、ヒント機能として実装されたので、私がいるんです。<br>ヒントが必要なときは、遠慮なく呼んでくださいね。",
        "ブログ": "このサイトにブログもあるみたいなんですが、見つけられてないんですよね……。偶然見つけたりできるかな……？",
        "ミニナンプレ": "開発者さんが最初に作ったパズルみたいですね。質素ですが、なかなか面白いですよ。でもちょっと余白が大きくて寂しいですよね……。",
        "シード値": "シード値ってパズルの盤面を再現するための特別な値のはずですが、ミニナンプレにあるシード値はちゃんと機能してないみたいですね……。特別な意味でもあるのでしょうか……？",
        "mini1234": "……あれ？そのワードどこかで見たことあるような気がします……。どこか別のところで使いそうなパスワードですね……。",
        "特殊ワード": "……？特殊ワード……？ そんなのあったかな……？ もしかして、何か特別なワードを知っているんですか？",
        "Developページ": {
            message: "あっ……！ そのワードは……！ ちょっと待ってくださいね……！",
            dialogue: [
                { name: "リリィ", text: "……驚きました。まさか本当にこのサイトがあるなんて。", icon: "！" },
                { name: "リリィ", text: "「Developページ」……。それは、このサイトの裏側にある開発中のページです……。", icon: "…" },
                { name: "リリィ", text: "普通の方法では辿り着けないようになっていますが……今なら、もしかすると……。", icon: "💡" },
                { name: "リリィ", text: "見つけました！どうやら開発途中でアクセスできないようになってたみたいです。", icon: "🔍" },
                { name: "リリィ", text: "さっきの「シード値入力欄」に『develop0』と入力してみてください。", icon: "！" },
                { name: "リリィ", text: "きっと新しいものが見つかるはずです。", icon: "✨" },
                { name: "リリィ", text: "では、幸運を祈ります……！", icon: "♪" },
            ]
        },
        "6x6": "まさか私の知らないページがあったなんて……。このサイトにはまだまだ秘密が隠されているのかもしれませんね……。",
        "サンプルページ": "何者かによって飛ばされてしまいましたね……。どうやらブログのサンプルページのようです。もしかしたらブログの中にヒントがあるのかもしれませんね……。",
        "ねぎ塩の畑": "どうやら開発者のブログのようですね。初めて見ました……。ですが、ほとんど投稿されてませんね……。",
        
    };

    /** 簡易掲示板の制御 **/
    function initRetroBBS() {
        const input = document.getElementById('bbs-input');
        const submit = document.getElementById('bbs-submit');
        const output = document.getElementById('bbs-output');
        const mascotMsg = document.getElementById('mascot-msg');

        if (!input || !submit || !output) return;

        const sendMessage = () => {
            const text = input.value.trim();
            if (text === "") return;

            const userMsgDiv = document.createElement('div');
            userMsgDiv.style.marginBottom = "3px";
            userMsgDiv.innerHTML = `<span style="color: blue; font-weight: bold;">YOU:</span> ${text}`;
            output.appendChild(userMsgDiv);

            let responseFound = false;
            for (let key in keywordResponses) {
                if (text.includes(key)) {
                    let entry = keywordResponses[key];
                    let responseText = typeof entry === 'string' ? entry : entry.message;
                    
                    const systemMsgDiv = document.createElement('div');
                    systemMsgDiv.style.marginBottom = "3px";
                    systemMsgDiv.innerHTML = `<span style="color: red; font-weight: bold;">Lily:</span> ${responseText}`;
                    output.appendChild(systemMsgDiv);

                    if (mascotMsg) {
                        mascotMsg.innerText = responseText;
                    }

                    if (typeof entry === 'object' && entry.dialogue) {
                        startNewDialogue(entry.dialogue);
                    }

                    responseFound = true;
                    break; 
                }
            }

            if (!responseFound) {
                const defaultMsgDiv = document.createElement('div');
                defaultMsgDiv.style.color = "#666";
                defaultMsgDiv.style.fontSize = "10px";
                defaultMsgDiv.innerText = "（リリィは特に反応しなかったようだ……）";
                output.appendChild(defaultMsgDiv);
            }

            input.value = "";
            output.scrollTop = output.scrollHeight;
        };

        submit.addEventListener('click', sendMessage);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.keyCode === 13) {
                sendMessage();
            }
        });
    }

    /** マスコットキャラクターの会話制御 (インライン版) **/
    const mascotMessages = [
        "こんにちは！リリィの部屋へようこそ。",
        "この部屋は現在大工事中です。ご不便をおかけします。",
        "左のメニューからいろんなページに行けますよ。",
        "キリ番を踏んだら、ぜひ私に教えてくださいね。",
        "何か困ったことがあったら、私を呼んでください。",
        "ある程度探索できたら、左のメニューからパズルを遊んでみてくださいね。",
    ];

    let mascotIndex = 0;

    function initMascot() {
        const img = document.getElementById('mascot-img');
        const msg = document.getElementById('mascot-msg');
        const next = document.getElementById('mascot-next-btn');

        if (!img || !msg || !next) return;

        msg.innerText = mascotMessages[0];

        img.onclick = function() {
            img.style.transition = '0.1s';
            img.style.transform = 'scale(1.2) translateY(-5px)';
            setTimeout(() => { img.style.transform = 'scale(1) translateY(0)'; }, 100);

            mascotIndex = (mascotIndex + 1) % mascotMessages.length;
            msg.innerText = mascotMessages[mascotIndex];
        };

        next.onclick = function(e) {
            e.stopPropagation();
            mascotIndex = (mascotIndex + 1) % mascotMessages.length;
            msg.innerText = mascotMessages[mascotIndex];
        };
    }
