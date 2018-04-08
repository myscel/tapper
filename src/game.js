/**
 * Componentes a pintar del juego
 */
var sprites = {
    //Cerveza llena
    Beer: { sx: 512, sy: 99, w: 23, h: 32, frames: 1 },
    //Cerveza vacía
    Glass: { sx: 512, sy: 131, w: 23, h: 32, frames: 1 },
    //cliente
    NPC: { sx: 512, sy: 66, w: 33, h: 33, frames: 1 },
    //Pared de la izquierda
    ParedIzda: { sx: 0, sy: 0, w: 512, h: 480, frames: 1 },
    //Camarero
    Player: { sx: 512, sy: 0, w: 56, h: 66, frames: 1 },
    //Zona de colisión
    Dead: { sx: 171, sy: 49, w: 5, h: 60, frames: 1 },
    //Tablero de fondo
    TapperGameplay: { sx: 0, sy: 480, w: 512, h: 480, frames: 1 }
};

/**
 * Variables de colisión de los diferentes elementos del juego
 */
var OBJECT_PLAYER = 1, //Jugador
    OBJECT_BEER = 2, //Cerveza
    OBJECT_CLIENT = 4, //Cliente
    OBJECT_DEADZONE = 8; //Zona de conflicto

/**
 * Función para empezar el juego con los títulos de inicio
 */
var startGame = function() {
    Game.setBoard(4, new TitleScreen("TAPPER", "Press enter to start playing", playGame));
};

/**
 * Posiciones posibles del jugador(camarero)
 */
pos1 = { x: 325, y: 90 };
pos2 = { x: 357, y: 185 };
pos3 = { x: 389, y: 281 };
pos4 = { x: 421, y: 377 };

/**
 * Función jugar juego 
 */
var playGame = function() {
    Game.setBoard(4, new GameBoard());
    var board = new GameBoard();
    board.add(new Player());
    board.add(new DeadZone(pos1.x + 20, pos1.y));
    board.add(new DeadZone(pos2.x + 20, pos2.y));
    board.add(new DeadZone(pos3.x + 20, pos3.y));
    board.add(new DeadZone(pos4.x + 20, pos4.y));

    board.add(new DeadZone(107, pos1.y));
    board.add(new DeadZone(72, pos2.y));
    board.add(new DeadZone(41, pos3.y));
    board.add(new DeadZone(8, pos4.y));

    //numClientes, frecuencia, retardoInicial, numBarra
    var c1 = 1;
    var c2 = 1;
    var c3 = 1;
    var c4 = 1;
    board.add(new Spawner(c1, 1, 1, 1));
    board.add(new Spawner(c2, 2, 2, 2));
    board.add(new Spawner(c3, 3, 3, 3));
    board.add(new Spawner(c4, 4, 4, 4));

    admin.setTotalClientes(c1 + c2 + c3 + c4);

    Game.setBoard(0, new Fondo());
    Game.setBoard(1, board);
    Game.setBoard(2, new Pared());
};

/**
 * Fondo del juego
 */
var Fondo = function() {
    this.setup('TapperGameplay', { x: 0, y: 0 });
};

Fondo.prototype = new Sprite();
Fondo.prototype.step = function(dt) {};

/**
 * Pared izquierda del juego para ocultar la salida y llegada de clientes y cervezass
 */
var Pared = function() {
    this.setup('ParedIzda', { x: 0, y: 0 });
};

Pared.prototype = new Sprite();
Pared.prototype.step = function(dt) {};

/**
 * Zonas de colisión
 * @param {int} posx coordenadas x donde se establece
 * @param {int} posy coordenadas y donde se establece
 */
var DeadZone = function(posx, posy) {
    this.setup('Dead', { x: posx, y: posy });
};

DeadZone.prototype = new Sprite();
DeadZone.prototype.type = OBJECT_DEADZONE;
DeadZone.prototype.step = function(dt) {
    return;
};

/**
 * Cervezas
 * @param {int} x  coordenadas x
 * @param {int} y  coordenadas y
 * @param {int} vel velocidad de movimiento 
 * @param {bool} estado estado de la cerveza, puede estar llena o vacía
 */
var Beer = function(x, y, vel, estado) {
    this.setup(estado, { vx: vel });
    this.x = x
    this.y = y;
    this.estado = estado;
};

Beer.prototype = new Sprite();
Beer.prototype.type = OBJECT_BEER;
Beer.prototype.step = function(dt) {
    this.x = this.x - (this.w / this.vx); //Actualizar su posición
    if (this.estado === 'Glass') {
        var collision1 = this.board.collide(this, OBJECT_PLAYER);
        if (collision1) {
            admin.disminuirJarrasVacias();
            this.board.remove(this);
        }

        var collision2 = this.board.collide(this, OBJECT_DEADZONE);
        if (collision2) {
            this.board.remove(this);
            admin.aumentarFallos();
        }
    } else if (this.estado === 'Beer') {
        var collision = this.board.collide(this, OBJECT_DEADZONE);
        if (collision) {
            this.board.remove(this);
            admin.aumentarFallos();
        }
    }
};

/**
 * Generador de clientes
 * @param {*} numClientes  número de clientes que genera la barra
 * @param {*} frecuencia  tiempo entre la salida del primer cliente y el resto
 * @param {*} retardoInicial tiempo a esperar hasta la salida del primer cliente
 * @param {*} numBarra número de la barra(1,2,3,4) donde se generan los clientes
 */
var Spawner = function(numClientes, frecuencia, retardoInicial, numBarra) {
    this.numClientes = numClientes;
    this.contClientes = 0;
    this.frecuencia = frecuencia;
    this.retardoInicial = retardoInicial;
    this.client;
    this.barra = numBarra;
    this.tiempo = 0;
    this.primercliente = false;
};

Spawner.prototype = new Sprite();
Spawner.prototype.draw = function() {
    return;
}
Spawner.prototype.step = function(dt) {
    if (this.contClientes < this.numClientes) {
        if (!this.primercliente) {
            if (this.tiempo >= this.retardoInicial) {
                this.tiempo = 0;
                if (this.barra === 1) {
                    this.client = new Client(110, pos1.y, 100);
                } else if (this.barra === 2) {
                    this.client = new Client(75, pos2.y, 100);
                } else if (this.barra === 3) {
                    this.client = new Client(44, pos3.y, 100);
                } else if (this.barra === 4) {
                    this.client = new Client(11, pos4.y, 100);
                }
                this.contClientes++;
                this.primercliente = true;
                this.board.add(this.client);

            } else {
                this.tiempo += dt;
            }
        } else {
            if (this.tiempo >= this.frecuencia) {
                this.tiempo = 0;
                if (this.barra === 1) {
                    this.client = new Client(110, pos1.y, 100);
                } else if (this.barra === 2) {
                    this.client = new Client(75, pos2.y, 100);
                } else if (this.barra === 3) {
                    this.client = new Client(44, pos3.y, 100);
                } else if (this.barra === 4) {
                    this.client = new Client(11, pos4.y, 100);
                }
                this.contClientes++;

                this.board.add(this.client);
            } else {
                this.tiempo += dt;
            }
        }




    }
};

/**
 * Cliente
 * @param {int} x  coordenadas x
 * @param {int} y coordenadas y
 * @param {int} vel velocidad de movimiento del cliente
 */
var Client = function(x, y, vel) {
    this.setup('NPC', { vx: vel });
    this.x = x
    this.y = y;
};

Client.prototype = new Sprite();
Client.prototype.type = OBJECT_CLIENT;
Client.prototype.step = function(dt) {
    this.x = this.x + (dt * this.vx); //Actualizar su posición

    var collision = this.board.collide(this, OBJECT_BEER);
    if (collision) {
        admin.aumentarJarrasVacias();
        admin.aumentarClientesServidos();
        this.board.remove(this);
        collision.hit(this.damage);
        this.board.add(new Beer(this.x, this.y, -17, 'Glass'));
    }
    var collision2 = this.board.collide(this, OBJECT_DEADZONE);
    if (collision2) {
        this.board.remove(this);
        admin.aumentarFallos();
    }
};

/**
 * Jugador
 * @param {int} x coordenadas x 
 * @param {int} y coordenadas y
 */
var Player = function(x, y) {
    this.setup('Player', { x: 325, y: 90 });
}

var espera = false;

var posBarman = [pos1, pos2, pos3, pos4];

Player.prototype = new Sprite();
Player.prototype.type = OBJECT_PLAYER;
Player.prototype.step = function(dt) {
    if (Game.keys['Arriba'] && !espera) {
        espera = true;
        if (this.x === posBarman[0].x && this.y === posBarman[0].y) {
            this.x = posBarman[3].x;
            this.y = posBarman[3].y;
        } else if (this.x === posBarman[1].x && this.y === posBarman[1].y) {
            this.x = posBarman[0].x;
            this.y = posBarman[0].y;
        } else if (this.x === posBarman[2].x && this.y === posBarman[2].y) {
            this.x = posBarman[1].x;
            this.y = posBarman[1].y;
        } else if (this.x === posBarman[3].x && this.y === posBarman[3].y) {
            this.x = posBarman[2].x;
            this.y = posBarman[2].y;
        }

    } else if (Game.keys['Abajo'] && !espera) {
        espera = true;
        if (this.x === posBarman[0].x && this.y === posBarman[0].y) {
            this.x = posBarman[1].x;
            this.y = posBarman[1].y;
        } else if (this.x === posBarman[1].x && this.y === posBarman[1].y) {
            this.x = posBarman[2].x;
            this.y = posBarman[2].y;
        } else if (this.x === posBarman[2].x && this.y === posBarman[2].y) {
            this.x = posBarman[3].x;
            this.y = posBarman[3].y;
        } else if (this.x === posBarman[3].x && this.y === posBarman[3].y) {
            this.x = posBarman[0].x;
            this.y = posBarman[0].y;
        }
    } else if (Game.keys['Espacio'] && !espera) {
        espera = true;
        console.log(this);
        this.board.add(new Beer(this.x - 27, this.y, 17, 'Beer'));
    } else if (!Game.keys['Arriba'] && !Game.keys['Abajo'] && !Game.keys['Espacio']) {
        espera = false;
    }
};

/**
 * Controlador del juego
 */
var GameManager = function() {
    this.totalClientes;
    this.jarrasVacias = 0;
    this.clientesServidos = 0;
    this.fallos = 0;
};

/**
 * Aumenta el número de jarras actualmente vacías
 */
GameManager.prototype.aumentarJarrasVacias = function() {
    this.jarrasVacias++;
    this.comprobarFinal();
}

/**
 * Disminuye el número de jarras actualmente vacías
 */
GameManager.prototype.disminuirJarrasVacias = function() {
    if (this.jarrasVacias > 0) {
        this.jarrasVacias--;
    }
    this.comprobarFinal();
}

/**
 * Aumenta el número actual de clientes servidos
 */
GameManager.prototype.aumentarClientesServidos = function() {
    this.clientesServidos++;
    this.comprobarFinal();
}

/**
 * Aumenta el número de fallos que lleva ctualmente el jugador
 */
GameManager.prototype.aumentarFallos = function() {
    this.fallos++;
    this.comprobarFinal();
}

/**
 * Establece el número total de clientes a servir durante la partida
 */
GameManager.prototype.setTotalClientes = function(total) {
    this.totalClientes = total;
    this.comprobarFinal();
}

/**
 * Comprueba si el jugador ha perdido o ha ganado
 */
GameManager.prototype.comprobarFinal = function() {
    if (this.fallos > 0) {
        this.restartDatos();
        Game.setBoard(4, new TitleScreen("YOU LOSE", "Press enter to play again", playGame));
    } else {
        if (this.totalClientes === this.clientesServidos && this.jarrasVacias === 0) {
            this.restartDatos();
            Game.setBoard(4, new TitleScreen("YOU WIN", "Press enter to play again", playGame));
        }
    }
}

/**
 * Reinicia los valores iniciales de la partida al terminar una partida
 */
GameManager.prototype.restartDatos = function() {
    this.jarrasVacias = 0;
    this.clientesServidos = 0;
    this.fallos = 0;
}


var admin = new GameManager();

window.addEventListener("load", function() {
    Game.initialize("game", sprites, startGame); // Cambiado 
});