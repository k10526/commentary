function Commentary(target, width, height, title, callback) {
  if(!window.getSelection) {
    alert('unsupported browser');
    return null;
  }
  target = target instanceof HTMLElement? target : (document.querySelector(target) || document.body);
  width = width || 480;
  height = height || 200;
  callback = callback || new Function();
  
  this.el = document.createElement('div');
  this.el.className = 'cm-container';
  this.el.innerHTML = '<div class="cm-title"></div><div class="cm-contenteditable" contenteditable=true></div><div class="cm-bottom"><span class="cm-counter">0/3000</span><button>등록</button></div>';
  this.el.style.width = width + 'px';
  this.el.style.height = height + 'px';

  this.titleBar = this.el.firstElementChild;
  this.editor = this.el.children[1];
  this.counter = this.el.children[2].firstElementChild;
  this.button = this.el.children[2].children[1];
  this.titleBar.innerHTML = title || '댓글 등록';
  this.editor.style.height = (height - 70) + 'px';

  target.appendChild(this.el);

  this.ctxMenu = new CommentaryMenu();
  // add eventlisteners;
  var _this_ = this;
  this.editor.addEventListener('mouseup', function() { setTimeout(function() { _this_.popupMenu(); }, 17); });
  this.editor.addEventListener('keydown', function(e) { _this_.checkCount(e); });
  this.editor.addEventListener('keyup', function() { _this_.popupMenu(); });

  this.button.addEventListener('click', function() { callback(_this_.editor.innerHTML); });
}

Commentary.prototype = {
  checkCount: function(e) {
    var textCount = this.editor.textContent.length;
    var brCount = (this.editor.innerHTML.match(/<br>/g) || []).length;
    var crCount = 0;

    if(textCount + brCount + crCount>3000) {
      e.preventDefault();
      return false;
    }

    this.counter.innerHTML = (textCount + brCount + crCount) + '/3000';
  },
  popupMenu: function() {
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);

    if(range.collapsed) {
      this.ctxMenu.close();
      return;
    }
    this.ctxMenu.pop(this.editor, range);
  }
}

var _CM_INSTANCE_ = null;
function CommentaryMenu() {
  if(_CM_INSTANCE_) return _CM_INSTANCE_;

  _CM_INSTANCE_ = this;

  this.el = document.createElement('div');
  this.el.innerHTML = '<span style="font-weight:bold">굵게</span> <span style="font-style:italic">기울임</span> <span style="text-decoration:underline">밑줄</span> <span style="text-decoration:line-through">취소선</span>';
  this.el.className = 'cm-ctxmenu';

  // add eventlisteners
  var _this_ = this;
  this.el.children[0].addEventListener('click', function() { _this_.execCommand('bold'); });
  this.el.children[1].addEventListener('click', function() { _this_.execCommand('italic'); });
  this.el.children[2].addEventListener('click', function() { _this_.execCommand('underline'); });
  this.el.children[3].addEventListener('click', function() { _this_.execCommand('strikeThrough'); });
  this.italic = this.el.children[1];

  this.target = null;
  this.range = null;
}

CommentaryMenu.prototype = {
  pop: function(target, range) {
    this.range = range;
    var firstRange = new Range();
    firstRange.selectNode(range.startContainer);
    var rect = firstRange.getBoundingClientRect();

    document.body.appendChild(this.el);
    this.el.style.left = (rect.left + rect.right - this.el.offsetWidth/2)/2;
    this.el.style.top = rect.top - 40;
    this.target = target instanceof HTMLElement? target : (document.querySelector(target) || document.body);

    this.applyStyle();

  },

  close: function() {
    this.range = null;
    this.el.parentNode && this.el.parentNode.removeChild(this.el);
  },

  execCommand: function(cmd) {
    var selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(this.range);

    document.execCommand(cmd);

    selection.collapseToEnd();
    this.close();
  },

  applyStyle() {
    var node = this.range.startContainer;

    var b = true, i = true, u = true, s = true;
    while(node!=this.range.endNode) {
      var cs = window.getComputedStyle(node.parentElement);

      b = b && (cs.fontWeight == 'bold' || cs.fontWeight > 400);
      i = i && cs.fontStyle == 'italic';
      u = u && (cs.textDecoration.indexOf('underline')>=0 || cs.webkitTextDecorationsInEffect.indexOf('underline')>=0);
      s = s && (cs.textDecoration.indexOf('line-through')>=0 || cs.webkitTextDecorationsInEffect.indexOf('line-through')>=0);
      node = node.nextSibling;
    }

    b? this.el.children[0].classList.add('active') : this.el.children[0].classList.remove('active');
    i? this.el.children[1].classList.add('active') : this.el.children[1].classList.remove('active');
    u? this.el.children[2].classList.add('active') : this.el.children[2].classList.remove('active');
    s? this.el.children[3].classList.add('active') : this.el.children[3].classList.remove('active');
  }
}