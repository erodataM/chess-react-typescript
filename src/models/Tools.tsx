const tab64 = [
    21, 22, 23, 24, 25, 26, 27, 28,
    31, 32, 33, 34, 35, 36, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48,
    51, 52, 53, 54, 55, 56, 57, 58,
    61, 62, 63, 64, 65, 66, 67, 68,
    71, 72, 73, 74, 75, 76, 77, 78,
    81, 82, 83, 84, 85, 86, 87, 88,
    91, 92, 93, 94, 95, 96, 97, 98
];

const tab120 = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

export class Tools {
    static tabPion = [[11, 9, 1], [9, 7, -1]];
    static tabCav = [[21, 17], [19, 15], [-21, -17], [-19, -15], [12, 10], [8, 6], [-12, -10], [-8, -6]];
    static tabFou = [[11, 9], [-11, -9], [9, 7], [-9, -7]];
    static tabTour = [[10, 8], [-10, -8], [1, 1], [-1, -1]];
    static tabRoi = [[11, 9], [-11, -9], [9, 7], [-9, -7], [10, 8], [-10, -8], [1, 1], [-1, -1]];

    static fen: {[index: string]:any} = {
        '1' : 'P',
        '2' : 'N',
        '3' : 'B',
        '4' : 'R',
        '5' : 'Q',
        '6' : 'K',
        '-1' : 'p',
        '-2' : 'n',
        '-3' : 'b',
        '-4' : 'r',
        '-5' : 'q',
        '-6' : 'k'
    };

    static cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    static pieces = {
        '1' : 'P',
        '2' : 'C',
        '3' : 'F',
        '4' : 'T',
        '5' : 'D',
        '6' : 'R',
        '-1' : 'P',
        '-2' : 'C',
        '-3' : 'F',
        '-4' : 'T',
        '-5' : 'D',
        '-6' : 'R'
    };

    static uciPromote = {
        'q': -5,
        'Q': 5,
        'r': -4,
        'R': 4,
        'b': -3,
        'B': 3,
        'n': -2,
        'N': 2
    }

    static getColumn(index: number): string {
        return Tools.cols[index % 8];
    }

    static getRow(index: number): string {
        return (9 - (Math.trunc(index / 8) + 1)).toString();
    }

    static isIn120(pt: number, l: number): boolean {
        return (tab120[tab64[pt] + l] === 1);
    }

    static isOnPromotion(trait: boolean, i: number): boolean {
        const s = trait ? 1 : -1;

        return (i > 7 && i < 16 && s === 1) || (i > 47 && i < 56 && s === -1);
    }

    static isPawnFirstMove(trait: boolean, i: number): boolean {
        const s = trait ? 1 : -1;

        return (i > 47 && i < 56 && s === 1) || (i > 7 && i < 16 && s === -1);
    }
}
