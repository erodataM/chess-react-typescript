import { Tools } from './Tools';

export class Position {
    diag: number[];
    trait: boolean;
    roi: number[];
    pr: boolean[];
    gr: boolean[];
    pep: number;
    move_type: string;

    static getPositionFromFen(fen: string): Position {
        const diag: number[] = [], roi: number[] = [60, 4], pr: boolean[] = [true, true], gr: boolean[] = [true, true], pep = -1;
        const aFenParts: string[] = fen.split(' ');

        const pos: string = aFenParts[0];

        let index = 0;

        for (let i = 0; i < pos.length; i++) {
            if (pos[i] === 'K') {
                diag[index] = 6;
                roi[0] = index;
                index++;
            }
            if (pos[i] === 'k') {
                diag[index] = -6;
                roi[1] = index;
                index++;
            }
            if (pos[i] === 'Q') {
                diag[index] = 5;
                index++;
            }
            if (pos[i] === 'q') {
                diag[index] = -5;
                index++;
            }
            if (pos[i] === 'R') {
                diag[index] = 4;
                index++;
            }
            if (pos[i] === 'r') {
                diag[index] = -4;
                index++;
            }
            if (pos[i] === 'B') {
                diag[index] = 3;
                index++;
            }
            if (pos[i] === 'b') {
                diag[index] = -3;
                index++;
            }
            if (pos[i] === 'N') {
                diag[index] = 2;
                index++;
            }
            if (pos[i] === 'n') {
                diag[index] = -2;
                index++;
            }
            if (pos[i] === 'P') {
                diag[index] = 1;
                index++;
            }
            if (pos[i] === 'p') {
                diag[index++] = -1;
            }

            const regexp = /^\d$/;

            if (regexp.test(pos[i])) {
                for (let j = 0; j < parseInt(pos[i], 10); j++) {
                  diag[index++] = 0;
                }
            }
        }
        if (index < 64) {
            for (let i = index; i < 64; i++) {
                diag[i] = 0;
            }
        }
        const trait = aFenParts[1] === 'w';
        pr[0] = aFenParts[2][0] === 'K';
        gr[0] = aFenParts[2][1] === 'Q';
        pr[1] = aFenParts[2][2] === 'k';
        gr[1] = aFenParts[2][3] === 'q';

        return new Position(diag, trait, roi, pr, gr, pep, 'MOVE');
    }

    static getPosition(position: Position): Position {
        return new Position(position.diag, position.trait, position.roi, position.pr, position.gr, position.pep, position.move_type);
    }

    constructor(diag: number[], trait: boolean, roi: number[], pr: boolean[], gr: boolean[], pep: number, move_type: string) {
        let n;
        this.trait = trait;
        this.diag = [];
        for (n = 0; n < 64; n++) {
            this.diag[n] = diag[n];
        }

        this.roi = [];
        this.roi[0] = roi[0];
        this.roi[1] = roi[1];

        this.pr = [];
        this.pr[0] = pr[0];
        this.pr[1] = pr[1];

        this.gr = [];
        this.gr[0] = gr[0];
        this.gr[1] = gr[1];

        this.pep = pep;

        this.move_type = move_type;
    }

    isInCheck(): boolean {
        let a, s, t, tour, fou;

        if (this.trait) {
            s = -1;
            t = 0;
        } else {
            s = 1;
            t = 1;
        }

        if ((Tools.isIn120(this.roi[t], s * 9) && this.diag[this.roi[t] + s * 7] === s)
         || (Tools.isIn120(this.roi[t], s * 11) && this.diag[this.roi[t] + s * 9] === s)
         || (Tools.isIn120(this.roi[t], 21) && this.diag[this.roi[t] + 17] === s * 2)
         || (Tools.isIn120(this.roi[t], -21) && this.diag[this.roi[t] - 17] === s * 2)
         || (Tools.isIn120(this.roi[t], 19) && this.diag[this.roi[t] + 15] === s * 2)
         || (Tools.isIn120(this.roi[t], -19) && this.diag[this.roi[t] - 15] === s * 2)
         || (Tools.isIn120(this.roi[t], 12) && this.diag[this.roi[t] + 10] === s * 2)
         || (Tools.isIn120(this.roi[t], -12) && this.diag[this.roi[t] - 10] === s * 2)
         || (Tools.isIn120(this.roi[t], 8) && this.diag[this.roi[t] + 6] === s * 2)
         || (Tools.isIn120(this.roi[t], -8) && this.diag[this.roi[t] - 6] === s * 2)
            ) {
            return true;
        }

        for (fou in Tools.tabFou) {
            for (a = 1; Tools.isIn120(this.roi[t], Tools.tabFou[fou][0] * a); a++) {
                if (this.diag[this.roi[t] + Tools.tabFou[fou][1] * a] !== 0) {
                    if (this.diag[this.roi[t] + Tools.tabFou[fou][1] * a] === s * 3
                      || this.diag[this.roi[t] + Tools.tabFou[fou][1] * a] === s * 5
                      || (a === 1 && this.diag[this.roi[t] + Tools.tabFou[fou][1]] === s * 6)
                    ) {
                        return true;
                    } else {
                        break;
                    }
                }
            }
        }

        for (tour in Tools.tabTour) {
            for (a = 1; Tools.isIn120(this.roi[t], Tools.tabTour[tour][0] * a); a++) {
                if (this.diag[this.roi[t] + Tools.tabTour[tour][1] * a] !== 0) {
                    if (this.diag[this.roi[t] + Tools.tabTour[tour][1] * a] === s * 4
                      || this.diag[this.roi[t] + Tools.tabTour[tour][1] * a] === s * 5
                      || (a === 1 && this.diag[this.roi[t] + Tools.tabTour[tour][1]] === s * 6)
                    ) {
                        return true;
                    } else {
                        break;
                    }
                }
            }
        }

        return false;
    }

    getFen(): string {
        let sReturn = '';
        let i: number;
        let vide = 0;
        for (i = 0; i < 64; i++) {
            if (this.diag[i] === 0) {
                vide++;
            } else {
                if (vide !== 0) {
                    sReturn += vide.toString();
                    vide = 0;
                }
                sReturn += Tools.fen[this.diag[i].toString()];
            }
            if ((i + 1) % 8 === 0 && i !== 63) {
                if (vide !== 0) {
                    sReturn += vide.toString();
                    vide = 0;
                }
                sReturn += '/';
            }
        }
        sReturn += ' ';
        sReturn += this.trait ? 'w' : 'b';
        sReturn += ' ';
        if (this.pr[0]) {
            sReturn += 'K';
        } else {
            sReturn += '-';
        }
        if (this.gr[0]) {
            sReturn += 'Q';
        } else {
            sReturn += '-';
        }
        if (this.pr[1]) {
            sReturn += 'k';
        } else {
            sReturn += '-';
        }
        if (this.gr[1]) {
            sReturn += 'q';
        } else {
            sReturn += '-';
        }
        sReturn += ' ';
        if (this.pep === -1) {
            sReturn += '-';
        } else {
            sReturn += this.getAlgebricPep();
        }
        sReturn += ' 0 1';

        return sReturn;
    }

    getAlgebricPep(): string {
        const x = this.pep % 8;
        const y = 8 - Math.trunc(this.pep / 8);
        return Tools.cols[x] + y.toString();
    }
}
