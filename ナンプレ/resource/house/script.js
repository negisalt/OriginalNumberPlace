    /** 
     * 会話データ：ここを編集することで会話内容を変更できます。
     * name: 表示される名前
     * text: 表示されるテキスト（HTMLタグ使用可）
     * icon: アイコンに表示する文字または画像HTML（省略可）
     * pos: {top, left} ウィンドウの位置を動的に変更する場合（省略可）
     **/
    const dialogueData = [
        { 
            name: "リリィ", 
            text: "……あ、……こんにちは、来訪者。<br>よくここまで辿り着けましたね。",
            icon: "！",
            pos: { top: "400px", left: "500px" }
        },
        { 
            name: "リリィ", 
            text: "ここは私の「秘密の部屋」……。<br>……なんて、ただの工事中のページですけど。",
            icon: "…"
        },
        { 
            name: "リリィ", 
            text: "この懐かしい感じ、悪くないですよね？<br>私は結構気に入ってるんです。",
            icon: "♪"
        },
        { 
            name: "リリィ", 
            text: "えっと……。",
            icon: "…"
        },
        { 
            name: "リリィ", 
            text: "……あ、そうでした。<br>あなたに手伝っていただきたいことがあるんでした。",
            icon: "💡"
        },
        { 
            name: "リリィ", 
            text: "このサイトに突如あらわれた広告を消していただきたいんです。",
            icon: "@"
        },
        { 
            name: "リリィ", 
            text: "本当は私が対処すればよいのですが……、このサイトを維持するのが大変でここを離れられないんです……。",
            icon: "💦"
        },
        { 
            name: "リリィ", 
            text: "手伝っていただけるとの事なのでさっそく仕事をお願いします。",
            icon: "📚"
        },
        { 
            name: "リリィ", 
            text: "左のサイドバーにこのwebサイトのリンク一覧の<b>ABOUT</b>からこのサイトの概要のページを開いてほしいです。",
            icon: "🔍"
        },
        { 
            name: "リリィ", 
            text: "このサイトを調査する上で重要な情報があるかもしれません。",
            icon: "！"
        },
        { 
            name: "リリィ", 
            text: "それでは、よろしくお願いしますね。",
            icon: "♪"
        },
    ];

    let currentDialogueIndex = 0;

    function nextDialogue() {
        currentDialogueIndex++;
        if (currentDialogueIndex >= dialogueData.length) {
            currentDialogueIndex = dialogueData.length; // 最初に戻る
        }
        updateDialogue();
    }

    function updateDialogue() {
        const data = dialogueData[currentDialogueIndex];
        const windowEl = document.getElementById('assistant-window');
        const iconEl = document.getElementById('dialogue-icon');

        document.getElementById('dialogue-name').innerText = data.name;
        document.getElementById('dialogue-text').innerHTML = data.text;
        
        // アイコンの更新
        if (data.icon) {
            iconEl.innerHTML = data.icon;
        }

        // 位置の更新（データに指定がある場合のみ）
        if (data.pos) {
            windowEl.style.top = data.pos.top;
            windowEl.style.left = data.pos.left;
        }
    }

    document.oncontextmenu = function() { alert("右クリック禁止"); return false; }
     function select_menu() {
        menu = document.getElementsByName('menu')
        if (menu[0].checked) {
            document.getElementById('section_1').style.display = "";
            document.getElementById('section_2').style.display = "none";
            document.getElementById('section_3').style.display = "none";
        } else if (menu[1].checked) {
            document.getElementById('section_1').style.display = "none";
            document.getElementById('section_2').style.display = "";
            document.getElementById('section_3').style.display = "none";
        } else {
          document.getElementById('section_1').style.display = "none";
            document.getElementById('section_2').style.display = "none";
            document.getElementById('section_3').style.display = "";
        }
    }
    window.addEventListener('load', () => {
        select_menu();
        updateDialogue();
    });