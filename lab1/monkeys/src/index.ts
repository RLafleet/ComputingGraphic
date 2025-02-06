function parseLanguage(str) {
    let tokens = str.split(/\s+/);
    let index = 0;

    function Rule1() {
        while (index < tokens.length) {
            let sound = tokens[index];
            if (sound === "ой") {
                index++;
                Rule2();
                if (index < tokens.length && tokens[index] === "АЦЙ") {
                    index++;
                    Rule3();
                }
            } else {
                index++;
            }
        }
    }

    function Rule2() {
        if (index < tokens.length && tokens[index] === "ну") {
            index++;
            Rule2(); // рекурсивный вызов для вложенных "ну"
        }
        if (index < tokens.length) {
            Rule3();
        }
    }

    function Rule3() {
        if (index < tokens.length) {
            let sound = tokens[index];
            if (sound === "ух-ты") {
                index++;
                return;
            }
            if (sound === "хо") {
                index++;
                Rule3();
            }
        }
    }

    Rule1();
    console.log("Parsing complete");
}

parseLanguage("ой ну ну хо ух-ты АЦЙ хо ух-ты");
