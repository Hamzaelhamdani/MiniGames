const pageData = window.pageData;
const lanData = window.ideLan === 'zh' ? message.zh : message.en;
const vscode = acquireVsCodeApi();

function concepteleMade() {
  let conceptele = '';
  conceptele = `<div class="itemboxs">\n
                  <div class="topnames">${lanData.transformFileNum}</div>\n
                  <div class="botvals">${pageData.concept.modelAll}</div>\n
                </div>\n
                <div class="itemboxs">\n
                  <div class="topnames">${lanData.transformCompletely}<i class="iconfont icon-info"></i></div>\n
                  <div class="botvals">${pageData.concept.completely}</div>\n
                </div>\n
                <div class="itemboxs">\n
                  <div class="topnames">${lanData.transformPartially}<i class="iconfont icon-warning"></i></div>\n
                  <div class="botvals">${pageData.concept.partial}</div>\n
                </div>\n
                <div class="itemboxs">\n
                  <div class="topnames">${lanData.noSupport}<i class="iconfont icon-error"></i></div>\n
                  <div class="botvals">${pageData.concept.notsupport}</div>\n
                </div>`;
  const circleBox = document.querySelector('.rep-allbox');
  circleBox.innerHTML = conceptele;
}

function fileDetails(templete, type) {
  const liItemObj = {
    templete: `${lanData.templete}`,
    jsonModular: `${lanData.jsonModular}`,
    otherModular: `${lanData.otherModular}`,
    jsModular: `${lanData.jsModular}`,
    wxssModular: `${lanData.wxssModular}`,
    modularWxs: `${lanData.modularWxs}`,
    unsupported: `${lanData.unsupported}`,
    supportPart: `${lanData.supportPart}`
  };
  let keyArr = Object.keys(templete);
  if (keyArr.length === 0) {
    return;
  }
  const tabBox = document.querySelector('.tabs-box');
  const ulBox = tabBox.querySelector('.ul');
  const firstLi = ulBox.querySelectorAll('li')[0];
  if (firstLi) {
    firstLi.classList.add('actived');
  }
  const liItem = document.createElement('li');
  liItem.classList.add('tabs-item');
  liItem.setAttribute('data-type', type);
  liItem.innerHTML = liItemObj[type];

  ulBox.appendChild(liItem);
  const cardBox = tabBox.querySelector('.card-box');
  const firstCard = cardBox.querySelectorAll('.info-table')[0];
  if (firstCard) {
    firstCard.classList.add('actived');
  }
  const tableInfo = document.createElement('div');
  tableInfo.classList.add('info-table');
  tableInfo.classList.add(type);

  const recordTable = document.createElement('table');
  recordTable.classList.add('table');
  const thead = document.createElement('thead');
  thead.classList.add('head-table');
  thead.innerHTML = `<tr class="pages">\n<th>${lanData.filepath}</th>\n<th>${lanData.transformResult}</th>\n</tr>`;
  const tbody = document.createElement('tbody');
  let tbodyData = '';
  let unsupportedNum = 0;

  const warningArr = [];
  const errorArr = [];
  const successArr = [];
  keyArr.forEach(key => {
    if (templete[key].status === 1) {
      successArr.push(key);
    }
    if (templete[key].status === 3) {
      errorArr.push(key);
    }
    if (templete[key].status === 2) {
      warningArr.push(key);
    }
  });

  keyArr = [...errorArr, ...warningArr, ...successArr];

  let spanColor = 'warn';
  keyArr.forEach(key => {
    let icon = '';
    if (templete[key].status === 1) {
      icon = '<i class="iconfont icon-info"></i>';
    }
    if (templete[key].status === 3) {
      icon = '<i class="iconfont icon-error"></i>';
    }
    if (templete[key].status === 2) {
      icon = '<i class="iconfont icon-warning"></i>';
    }

    tbodyData = `${tbodyData}<tr>\n<td class="file-path limit-width">\n${key}\n</td>\n\n<td class="apge">\n${icon}\n</td>\n</tr>`;

    if (templete[key].supportType && templete[key].supportType !== 1) {
      unsupportedNum++;
    }

    if (templete[key].supportType === 3) {
      spanColor = 'err';
    }
  });

  tbody.innerHTML = tbodyData;
  const span = document.createElement('span');
  span.classList.add('num');

  liItem.appendChild(span);
  unsupportedNum = unsupportedNum || '';
  spanColor = unsupportedNum ? spanColor : 'none';
  span.innerHTML = unsupportedNum;
  span.classList.add(spanColor);
  recordTable.appendChild(thead);
  recordTable.appendChild(tbody);
  tableInfo.appendChild(recordTable);
  cardBox.appendChild(tableInfo);

  liItem.addEventListener('click', () => {
    ulBox.querySelectorAll('li').forEach(ele => {
      ele.classList.remove('actived');
    });

    cardBox.querySelectorAll('.info-table').forEach(ele => {
      ele.classList.remove('actived');
    });

    const cardName = liItem.getAttribute('data-type');
    cardBox.querySelector(`.${cardName}`).classList.add('actived');
    liItem.classList.add('actived');
  });
}

function supportiveness() {
  const supportPart = {};
  const unsupported = {};
  Object.keys(pageData.transforms).forEach(item => {
    if (pageData.transforms[item].status === 2) {
      supportPart[item] = pageData.transforms[item];
    }

    if (pageData.transforms[item].status === 3) {
      unsupported[item] = pageData.transforms[item];
    }
  });
  fileDetails(supportPart, 'supportPart');
  fileDetails(unsupported, 'unsupported');
}

function temelatetable() {
  const templete = {};
  const jsModular = {};
  const wxssModular = {};
  const jsonModular = {};
  const modularWxs = {};
  const otherModular = {};
  for (const key in pageData.transforms) {
    let type = pageData.transforms[key].type;
    let modular = Object.assign({}, pageData.transforms[key]);
    if (type === 'jsModular') {
      jsModular[key] = modular;
      jsModular[key].supportType = jsModular[key].status;
    }
    if (type === 'templete') {
      templete[key] = modular;
      templete[key].supportType = templete[key].status;
    }
    if (type === 'wxssModular') {
      wxssModular[key] = modular;
      wxssModular[key].supportType = wxssModular[key].status;
    }
    if (type === 'jsonModular') {
      jsonModular[key] = modular;
      jsonModular[key].supportType = jsonModular[key].status;
    }
    if (type === 'modularWxs') {
      modularWxs[key] = modular;
      modularWxs[key].supportType = modularWxs[key].status;
    }
    if (type === 'otherModular') {
      otherModular[key] = modular;
      otherModular[key].supportType = otherModular[key].status;
    }
  }
  fileDetails(jsModular, 'jsModular');
  fileDetails(templete, 'templete');
  fileDetails(jsonModular, 'jsonModular');
  fileDetails(wxssModular, 'wxssModular');
  fileDetails(modularWxs, 'modularWxs');
  fileDetails(otherModular, 'otherModular');
}

function fileInfo() {
  const mask = document.querySelector('.mask-info');
  const maskTitle = mask.querySelector('.title');
  const pagePath = document.querySelectorAll('.file-path');
  const tableBox = mask.querySelector('.box-table');
  pagePath.forEach(ele => {
    ele.addEventListener('click', () => {
      if (pageData.transforms[ele.innerText].type === 'templete') {
        tableBox.querySelector('#col1').innerText = `${lanData.col1}`;
        tableBox.querySelector('#col2').innerText = `${lanData.col2}`;
      }
      if (pageData.transforms[ele.innerText].type === 'jsModular') {
        tableBox.querySelector('#col1').innerText = `${lanData.apiLifecycle}`;
        tableBox.querySelector('#col2').innerText = `${lanData.unsupport}`;
      }
      if (pageData.transforms[ele.innerText].type === 'jsonModular') {
        tableBox.querySelector('#col1').innerText = `${lanData.propname}`;
        tableBox.querySelector('#col2').innerText = `${lanData.support}`;
        if (ele.innerText === 'app.json') {
          tableBox.querySelector('#col2').innerText = `${lanData.unsupportedSubproperty}`;
        }
      }
      if (pageData.transforms[ele.innerText].type === 'otherModular') {
        if (ele.innerText.indexOf('.js') !== -1) {
          tableBox.querySelector('#col1').innerText = `${lanData.apiLifecycle}`;
          tableBox.querySelector('#col2').innerText = `${lanData.unsupport}`;
        } else {
          tableBox.querySelector('#col1').style = 'display:none';
          tableBox.querySelector('#col2').style = 'display:none';
          tableBox.querySelector('#col3').style = 'display:none';
        }
      }

      maskTitle.innerText = ele.innerText;
      const myTbody = tableBox.querySelector('tbody');
      if (pageData.transforms[ele.innerText].components.length > 0) {
        pageData.transforms[ele.innerText].components.forEach(item => {
          const newtr = document.createElement('tr');
          let newtrStr = '';
          let opations = '';
          item.attrs.forEach(its => {
            opations += `<div class="opation-item">\n${window.ideLan === 'zh' ? its : lanData.noSupport}\n</div>`;
          });

          if (item.doc) {
            if (item.doc !== '无') {
              newtrStr += `<td class="name">\n${item.name}\n</td>\n<td class="opations">\n${opations}\n</td>\n
              <td class="result" path="${item.doc}">\n<a data-href="${item.doc}" class="help-doc-link">${lanData.helpdoc}</a></td>`;
            } else {
              newtrStr += `<td class="name">\n${item.name}\n</td>\n<td class="opations">\n${opations}\n</td>\n
              <td class="unsupported" path="">\n${lanData.try}\n</td>`;
            }
          } else {
            newtrStr += `<td class="name">\n${item.name}\n</td>\n<td class="opations">\n${opations}\n</td>\n
            <td class="unsupported">\n${lanData.try}\n</td>`;
          }
          newtr.innerHTML = newtrStr;

          myTbody.appendChild(newtr);
        });
      } else {
        let newtrStr = '';
        const newtr = document.createElement('tr');
        newtrStr = `<td class="name" colspan="3">\n${lanData.fullSupport}\n</td>`;
        newtr.innerHTML = newtrStr;
        myTbody.appendChild(newtr);
      }

      mask.classList.remove('hide');

      const helpDoc = mask.querySelectorAll('.result');
    });
  });

  document.addEventListener('click', (e) => {
    if (e.target.className === 'help-doc-link') {
      vscode.postMessage({
        key: 'ifOpenDoc',
        value: e.target.attributes['data-href'].value
      });
    }
  });
}


function maskClose() {
  const mask = document.querySelector('.mask-info');
  const tableBox = mask.querySelector('.box-table');
  mask.querySelector('.close').addEventListener('click', () => {
    tableBox.querySelector('table').innerHTML =
      `<thead>\n<tr>\n<th class="name header" id="col1">${lanData.col1}</th>\n` +
      `<th class="opations header"  id="col2">${lanData.col2}</th>\n<th class="result header"  id="col3">${lanData.col3}</th>\n` +
      '</tr>\n</thead>\n<tbody>\n</tbody>';
    mask.classList.add('hide');
  });
}

function projectResult() {
  const myProject = document.querySelector('#project');
  const surroundings = {};
  let tableInfo = '';
  for (const key in pageData.surroundings) {
    if (pageData.surrounding[key]) {
      surroundings[pageData.surroundings[key].name] = pageData.surroundings[key].val;
    }
  }
  pageData.tableInfo = Object.assign(pageData.tableInfo, surroundings);

  Object.keys(pageData.tableInfo).forEach(key => {
    tableInfo = `${tableInfo}<tr>\n<td class="left-text">\n${key}\n</td>\n
    <td class="left-text limit-width">\n${pageData.tableInfo[key]}\n</td>\n</tr>`;
  });
  myProject.querySelector('tbody').innerHTML = tableInfo;
}

function pageLoad() {
  projectResult();
  concepteleMade();
  temelatetable();
  supportiveness();
}

function changeHtmlLan() {
  document.title = lanData.title;
  document.querySelectorAll('.reps-title')[0].innerText = lanData.overView;
  document.querySelectorAll('.reps-title')[1].innerText = lanData.detail;
  document.querySelectorAll('.table-title')[0].innerText = lanData.compileTitle;
  document.querySelectorAll('.head-table .left-text')[0].innerText = lanData.statistics;
  document.querySelectorAll('.head-table .left-text')[1].innerText = lanData.result;
  document.querySelectorAll('#col1')[0].innerText = lanData.col1;
  document.querySelectorAll('#col2')[0].innerText = lanData.col2;
  document.querySelectorAll('#col3')[0].innerText = lanData.col3;
  document.querySelectorAll('#project tr td:first-child')[0].innerText = lanData.projectName;
  document.querySelectorAll('#project tr td:first-child')[1].innerText = lanData.porjectPath;
  document.querySelectorAll('#project tr td:first-child')[2].innerText = lanData.outputPath;
  document.querySelectorAll('#project tr td:first-child')[3].innerText = lanData.fileNum;
}

window.onload = function () {
  pageLoad();
  fileInfo();
  maskClose();
  changeHtmlLan();
};
