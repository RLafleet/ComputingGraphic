function blockTypes(cx, cy) {
    const blockTypes = [];

    const typeO = [
        [
            [cx, cy],
            [cx + 1, cy],
            [cx, cy + 1],
            [cx + 1, cy + 1]
        ],
        ...Array(3).fill([
            [cx, cy],
            [cx + 1, cy],
            [cx, cy + 1],
            [cx + 1, cy + 1]
        ])
    ];

    const typeI = [
        [
            [cx, cy],
            [cx, cy - 1],
            [cx, cy - 2],
            [cx, cy + 1]
        ],
        [
            [cx, cy],
            [cx - 1, cy],
            [cx + 1, cy],
            [cx + 2, cy]
        ],
        [
            [cx, cy],
            [cx, cy - 1],
            [cx, cy + 1],
            [cx, cy + 2]
        ],
        [
            [cx, cy],
            [cx + 1, cy],
            [cx - 1, cy],
            [cx - 2, cy]
        ],
    ];

    const typeS = [
        [
            [cx, cy],
            [cx, cy + 1],
            [cx + 1, cy],
            [cx + 1, cy - 1]
        ],
        [
            [cx, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx + 1, cy + 1]
        ],
        [
            [cx, cy],
            [cx, cy - 1],
            [cx - 1, cy],
            [cx - 1, cy + 1]
        ],
        [
            [cx, cy],
            [cx + 1, cy],
            [cx, cy - 1],
            [cx - 1, cy - 1]
        ],
    ];

    const typeZ = [
        [
            [cx, cy],
            [cx, cy - 1],
            [cx + 1, cy],
            [cx + 1, cy + 1]
        ],
        [
            [cx, cy],
            [cx + 1, cy],
            [cx, cy + 1],
            [cx - 1, cy + 1]
        ],
        [
            [cx, cy],
            [cx, cy + 1],
            [cx - 1, cy],
            [cx - 1, cy - 1]
        ],
        [
            [cx, cy],
            [cx - 1, cy],
            [cx, cy - 1],
            [cx + 1, cy - 1]
        ],
    ];

    const typeL = [
        [
            [cx, cy],
            [cx, cy + 1],
            [cx, cy - 1],
            [cx + 1, cy - 1]
        ],
        [
            [cx, cy],
            [cx - 1, cy],
            [cx + 1, cy],
            [cx + 1, cy + 1]
        ],
        [
            [cx, cy],
            [cx, cy - 1],
            [cx, cy + 1],
            [cx - 1, cy + 1]
        ],
        [
            [cx, cy],
            [cx + 1, cy],
            [cx - 1, cy],
            [cx - 1, cy - 1]
        ],
    ];

    const typeJ = [
        [
            [cx, cy],
            [cx, cy - 1],
            [cx, cy + 1],
            [cx + 1, cy + 1]
        ],
        [
            [cx, cy],
            [cx + 1, cy],
            [cx - 1, cy],
            [cx - 1, cy + 1]
        ],
        [
            [cx, cy],
            [cx, cy + 1],
            [cx, cy - 1],
            [cx - 1, cy - 1]
        ],
        [
            [cx, cy],
            [cx - 1, cy],
            [cx + 1, cy],
            [cx + 1, cy - 1]
        ],
    ];

    const typeT = [
        [
            [cx, cy],
            [cx, cy + 1],
            [cx, cy - 1],
            [cx + 1, cy]
        ],
        [
            [cx, cy],
            [cx - 1, cy],
            [cx + 1, cy],
            [cx, cy + 1]
        ],
        [
            [cx, cy],
            [cx, cy + 1],
            [cx, cy - 1],
            [cx - 1, cy]
        ],
        [
            [cx, cy],
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy - 1]
        ],
    ];

    blockTypes.push(typeO, typeI, typeS, typeZ, typeL, typeJ, typeT);

    return blockTypes;
}