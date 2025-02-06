function parseLanguage(str) {
    let tokens = str.split(/\s+/);
    let index = 0;

    function Rule1() {
        if (index >= tokens.length) {
            return false;
        }
        let sound = tokens[index];
        if (sound === "ой") {
            index++;
            if (!Rule2()) return false;
            if (index < tokens.length && tokens[index] === "ай") {
                index++;
                return Rule3();
            }
            return false;
        }
        return false;
    }

    function Rule2() {
        while (index < tokens.length && tokens[index] === "ну") {
            index++;
        }
        return true;
    }

    function Rule3() {
        if (index >= tokens.length) return false;
        let sound = tokens[index];

        if (sound === "ух-ты") {
            index++;
            return true;
        }
        if (sound === "хо") {
            index++;
            return Rule3();
        }
        return false;
    }

    let result = Rule1() && index === tokens.length;
    console.log(result ? "yes" : "no");
    return result ? "yes" : "no";
}

parseLanguage("ой ну ну ай ух-ты s"); // no
parseLanguage("ой ай ух-ты"); // yes
parseLanguage("ой ай хо ух-ты"); // yes
parseLanguage("ой ну ну ай хо ух-ты"); // yes
parseLanguage("ой ну ай хо хо ух-ты"); // yes
parseLanguage("ой ай"); // no
parseLanguage("ой ух-ты"); // no
parseLanguage("ой ай ну ух-ты"); // no
parseLanguage("хо ой ай ух-ты"); // no
parseLanguage("ой ну ну ну ну ну ай ух-ты"); // yes
parseLanguage("ай ну") // no