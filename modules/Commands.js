let COMMANDS = [];

function addCommand(data, func) {
    COMMANDS.unshift({data: data, func: func, message: ''});
}


function getCommand(index) {
    if (COMMANDS.length > index)
        return COMMANDS[index];
}

function parseCommand(match) {
    let command = COMMANDS.find(item => item.data.pattern.test(match));
    if (command !== undefined) {
        command.message = RegExp.$1;
        return command;
    }
}

module.exports = {
    addCommand: addCommand,
    getCommand: getCommand,
    perseCommand: parseCommand,
    commands: COMMANDS
}

