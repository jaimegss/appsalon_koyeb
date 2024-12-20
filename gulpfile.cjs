const path = require('path');
const fs = require('fs');
const { glob } = require('glob');
const { src, dest, watch, series, parallel } = require('gulp');
const dartSass = require('sass');
const gulpSass = require('gulp-sass')(dartSass);
const terser = require('gulp-terser');
const sharp = require('sharp');
const through2 = require('through2');

const paths = {
    scss: 'src/scss/**/*.scss',
    js: 'src/js/**/*.js'
};

function css(done) {
    src(paths.scss, { sourcemaps: true })
        .pipe(gulpSass({ outputStyle: 'compressed' }).on('error', gulpSass.logError))
        .pipe(dest('./public/build/css', { sourcemaps: '.' }));
    done();
}

function javascript(done) {
    src(paths.js)
        .pipe(terser())
        .pipe(dest('./public/build/js'));
    done();
}

async function imagenes(done) {
    const srcDir = './src/img';
    const buildDir = './public/build/img';
    const images = await glob('./src/img/**/*');

    images.forEach(file => {
        const relativePath = path.relative(srcDir, path.dirname(file));
        const outputSubDir = path.join(buildDir, relativePath);
        procesarImagenes(file, outputSubDir);
    });
    done();
}

function procesarImagenes(file, outputSubDir) {
    if (!fs.existsSync(outputSubDir)) {
        fs.mkdirSync(outputSubDir, { recursive: true });
    }
    const baseName = path.basename(file, path.extname(file));
    const extName = path.extname(file);

    if (extName.toLowerCase() === '.svg') {
        const outputFile = path.join(outputSubDir, `${baseName}${extName}`);
        fs.copyFileSync(file, outputFile);
    } else {
        const outputFile = path.join(outputSubDir, `${baseName}${extName}`);
        const outputFileWebp = path.join(outputSubDir, `${baseName}.webp`);
        const outputFileAvif = path.join(outputSubDir, `${baseName}.avif`);
        const options = { quality: 80 };

        sharp(file).jpeg(options).toFile(outputFile);
        sharp(file).webp(options).toFile(outputFileWebp);
        sharp(file).avif().toFile(outputFileAvif);
    }
}

function versionWebp() {
    return src('./src/img/**/*.{png,jpg}')
        .pipe(through2.obj(function (file, _, cb) {
            sharp(file.contents)
                .webp({ quality: 80 })
                .toBuffer((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        file.contents = data;
                        cb(null, file);
                    }
                });
        }))
        .pipe(dest('./public/build/img'));
}

function watchArchivos() {
    watch(paths.scss, css);
    watch(paths.js, javascript);
    watch('src/img/**/*.{png,jpg}', imagenes);
}

module.exports = {
    css,
    javascript,
    imagenes,
    versionWebp,
    watchArchivos,
    default: parallel(css, javascript, imagenes, versionWebp, watchArchivos),
    build: parallel(css, javascript, imagenes, versionWebp)
};