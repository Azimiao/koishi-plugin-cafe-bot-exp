const UniformRandom = require( '@stdlib/random-base-uniform' );

/**
 * 使用 FNV-1a 哈希算法将任意长度的字符串转换为 32 位无符号整数。
 * @param str - 输入字符串种子
 * @returns 32 位无符号整数
 */
function stringToSeed(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * PseudoRandom 伪随机数类
 */
class PseudoRandom {
  private seed: number;
  private randFunc: () => number;
  constructor(seedStr: string) {
    this.seed = stringToSeed(seedStr);
    if (this.seed === 0) {
      this.seed = 19700205;
    }
    this.randFunc = UniformRandom.factory(0.0, 1.0 ,{
      'seed':this.seed
    });
  }

  public next = (): number => {
    return this.randFunc();
  };

  public nextInt = (min: number, max: number): number => {
    return Math.floor(this.next() * (max - min + 1)) + min;
  };
}

export default PseudoRandom;
