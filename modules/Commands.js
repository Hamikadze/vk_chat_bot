let COMMANDS = [];

function addCommand(data, func) {
    COMMANDS.unshift({data: data, func: func, message: ''});
}


function getCommand(index) {
    if (COMMANDS.length > index)
        return COMMANDS[index];
}

function parseCommand(match) {
    let command = COMMANDS.filter(item => item.data.pattern.test(match));
    if (command !== undefined && command.length > 0) {
        command[0].data.pattern.test(match);
        command[0].message = RegExp.$1;
        return command[0];
    }
}

module.exports = {
    addCommand: addCommand,
    getCommand: getCommand,
    perseCommand: parseCommand,
    commands: COMMANDS
}

