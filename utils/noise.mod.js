/**
 * @module utils/noise
 */

/**
 * Skewing factor for 2D Simplex noise
 * @type {number}
 */
const F2 = 0.5 * Math.sqrt(3) - 1;
/**
 * Un-skewing factor for 2D Simplex noise
 * @type {number}
 */
const G2 = (3 - Math.sqrt(3)) / 6;
/**
 * Skewing factor for 3D Simplex noise
 * @type {number}
 */
const F3 = 1/3;
/**
 * Un-skewing factor for 3D Simplex noise
 * @type {number}
 */
const G3 = 1/6;
/**
 * Skewing factor for 4D Simplex noise
 * @type {number}
 */
const F4 = (Math.sqrt(5) - 1) / 4;
/**
 * Un-skewing factor for 4D Simplex noise
 * @type {number}
 */
const G4 = (5 - Math.sqrt(5)) / 20;

const mix = (a, b, t)=> a*(1-t) + b*t;

const fade = (t) => t*t*t*(t*(t*6-15)+10);

const sum = (array) => array.reduce((s,x)=> s+x);

const fastFloor = (x) => ((x>0) ? (x|0) : ((x|0)-1));

const dot = function (dim, v1, v2) {
    let res = 0, i = dim;
    while(i--) res += v1[i] * v2[i];
    return res;
};
const createGradients = function(dimension = 3) {
    //*
    const gradients = new Array(dimension * (1 << (dimension - 1)));
    let gradIdx = 0;
    for (let zero_pos = 0; zero_pos < dimension; zero_pos++) {
        for (let mask = 0; mask < (1 << (dimension - 1)); mask++) {
            gradients[gradIdx] = new Int8Array(dimension);
            for (let i = 0; i < dimension; i++) {
                if (i === zero_pos)     gradients[gradIdx][i] = 0;
                else if (i > zero_pos)  gradients[gradIdx][i] = (mask & (1 << (i - 1))) > 0 ? 1 : -1;
                else                    gradients[gradIdx][i] = (mask & (1 << i)) > 0 ? 1 : -1;
            }
            gradIdx++;
        }
    }
    return gradients;
    /*/
    const n = dimension|0;
    const nb_lines = (2**(n-1))*n;
    const result = new Array(nb_lines);
    let idx_zero = n-1;
    for(let i = 0; i < nb_lines; i++) {
        result[i] = new Array(n);
        result[i][idx_zero] = 0;
        for(let j=1; j< n; j++) {
            const val = ((i >> (j-1)) & 1) === 1 ? -1 : 1;
            if(idx_zero % 2 === 1)
                result[i][(idx_zero + n - j) % n] = val;
            else
                result[i][(idx_zero + j) % n] = val;
        }
        if(i % (2**(n-1)) === (2**(n-1))-1)
            idx_zero--;
    }
    return result;
    //*/
};
const getSimplexContrib = function(coords, p, indices, movement, gradients) {
    const coordsSquareSum = coords.reduce((sum,x) => x*x + sum, 0);
    if(coordsSquareSum >= 0.5) return 0;
    else {
        const factor = (0.5 - coordsSquareSum)**4;
        const gradIdx =  indices.reduce(
            (idx, x, j) => p[idx + x + movement[j]]
            , 0
        ) % gradients.length;
        return factor * dot(coords.length, gradients[gradIdx], coords)
    }
};

class Perlin {
    /**
     *
     * @param {utils/PRNG} prng
     * @param {number} dimension
     */
    constructor(prng, dimension = 3) {
        this.dimension = dimension;
        this.gradients = createGradients(dimension);
        this.p = new Uint8Array(512);
        for(let i=0; i<256; i++) {
            this.p[256+i] = this.p[i] = prng.next() % 256;
        }
    }

    /**
     * Computes the Perlin noise at the specified coordinate(s)
     * @param {Array<number>} position - coordinate(s) of the point to compute the noise of.
     *                                   Its dimension must be equal to the dimension specified
     *                                   in the constructor.
     * @returns {number}
     */
    noise(position) {
        const dim = this.dimension;
        const cell = new Uint8Array(dim);   /// grid cell indices
        const delta = new Array(dim);       /// position relative to grid cell
        const values = new Array(2**dim);   /// first row contains noise contributions,
                                            /// next rows contain interpolations across all axes
        const local_delta = new Array(dim); /// temporary vector used during calculations

        for(let i = 0; i < dim; i++) {
            // determine grid cell coordinates
            const floored_pos = fastFloor(position[i]);
            // position relative to cell
            delta[i] = position[i] - floored_pos;
            cell[i] = floored_pos % 256;
        }

        for(let i = 0; i < 2**dim; i++) {
            let index = 0; /// gradient index
            let j=dim;
            while(j--) {
                const offset = ((i>>(dim-j-1)) & 1);
                index = this.p[cell[j] + offset + index];
                local_delta[j] = delta[j] - offset;
            }
            values[i] = dot(dim, this.gradients[index % this.gradients.length], local_delta);
        }

        for(let i = 0; i < dim; i++) {
            const faded = fade(delta[i]);
            const sub_dim = 2**(dim-i-1);
            for(let j = 0; j < sub_dim; j++) {
                values[j] = mix(values[j], values[sub_dim+j], faded)
            }
        }
        return values[0];
    }
}

class Simplex {
    /**
     *
     * @param {utils/PRNG} prng
     * @param {number} dimension
     */
    constructor(prng, dimension) {
        this.dimension = dimension;
        this.gradients = createGradients(dimension);
        this.skew_factor = (Math.sqrt(dimension+1)-1) / dimension;
        this.unskew_factor = (dimension + 1 - Math.sqrt(dimension + 1)) / (dimension * (dimension + 1));
        this.p = new Array(512);
        for(let i=0; i<256; i++) {
            this.p[256+i] = this.p[i] = prng.next() % 256;
        }
    }

    /**
     * Computes the Perlin noise at the specified coordinate(s)
     * @param {Array<number>} position - coordinate(s) of the point to compute the noise of.
     *                                   Its dimension must be equal to the dimension specified
     *                                   in the constructor.
     * @returns {number}
     */
    noise(position) {
        const skewSum = position.reduce((sum,x)=>sum+x) * this.skew_factor;
        const skew_lattices = new Array(this.dimension);
        const gradient_base_indices = new Uint8Array(this.dimension);
        let unskewSum = 0;
        for(let i=this.dimension; i--;) {
            const lattice = fastFloor(position[i] + skewSum);
            skew_lattices[i] = lattice;
            unskewSum += lattice;
            gradient_base_indices[i] = lattice % 256;
        }
        unskewSum *= this.unskew_factor;
        const delta = new Array(this.dimension);
        const offsets = new Array(this.dimension);
        for(let i=this.dimension; i--;) {
            const cellOrigin = skew_lattices[i] - unskewSum;
            delta[i] = position[i] - cellOrigin;
            offsets[i] = [i, delta[i]];
        }
        offsets.sort((a, b) => b[1] - a[1]);

        const movement = new Uint8Array(this.dimension).fill(0);
        let result = getSimplexContrib(delta, this.p, gradient_base_indices, movement, this.gradients);
        for(let i=0; i<this.dimension;) {
            movement[offsets[i][0]] = 1;
            i++;
            const coords = delta.map((x, j)=> x - movement[j] + i * this.unskew_factor);
            result += getSimplexContrib(coords, this.p, gradient_base_indices, movement, this.gradients);
        }
        return result;
    }
}

class DomainWarping {
    //TODO
}
class Turbulence {
    //TODO
}
class Worley {
    //TODO
}
class Ridge {
    //TODO
}

export {
    Perlin,
    Simplex,
}