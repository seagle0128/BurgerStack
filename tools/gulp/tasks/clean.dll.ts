let del = require('del');
import Config from '../config';

export = () => {
  return del(Config.dist.dll);
};
