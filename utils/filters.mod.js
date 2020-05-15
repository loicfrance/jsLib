/**
 * @module utils/filters
 */
/**
 * a filter to use with Array.prototype.filter function, by binding the first argument <!--
 * -->to the array elements you want to keep.
 *
 * @example [1,2,3,4].filter(intersectionFilter.bind(undefined, [1,4,5,6])); //[1,4]
 * @param {Array} array
 * @param {object} x
 */
const inclusionFilter = (array, x) => array.indexOf(x) !== -1;
/**
 * a filter to use with Array.prototype.filter function, by binding the first argument <!--
 * -->to the array of element you want to exclude.
 *
 * @example [1,2,3,4].filter(exclusionFilter.bind(undefined, [1,4,5,6])); //[2,3]
 * @param {Array} array
 * @param {object} x
 */
const exclusionFilter = (array, x) => array.indexOf(x) === -1;
/**
 * a filter to use with Array.prototype.filter function, by binding the first argument <!--
 * -->to the class you want your objects to be instances of.
 *
 * @param {class} _class
 * @param {object} x
 */
const instanceFilter  = (_class, x) => x instanceof _class;

export {
    inclusionFilter,
    exclusionFilter,
    instanceFilter
}