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
    window.addEventListener('load', select_menu());