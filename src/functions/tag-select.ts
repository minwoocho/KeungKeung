document.addEventListener("DOMContentLoaded", function () {
  handleTagLayoutScroll("main-tag-layout");
  handleTagLayoutScroll("base-layout");
});

const headers = {
  "Content-Type": "application/json",
};

/**
 * 공통으로 뺄 예정
 * @param id scrollable element id
 * @returns None
 * @description Let element scrollabe by grabbing and move
 */
const handleTagLayoutScroll = (id: string) => {
  const ele = document.getElementById(id);
  if (!ele) return;

  let pos = { top: 0, left: 0, x: 0, y: 0 };

  const mouseDownHandler = function (e: any) {
    ele.style.userSelect = "none";

    pos = {
      left: ele.scrollLeft,
      top: ele.scrollTop,
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY,
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };

  const mouseMoveHandler = function (e: any) {
    // How far the mouse has been moved
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;

    // Scroll the element
    ele.scrollTop = pos.top - dy;
    ele.scrollLeft = pos.left - dx;
  };

  const mouseUpHandler = function () {
    ele.style.cursor = "grab";
    ele.style.removeProperty("user-select");

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };

  // Attach the handler
  ele.addEventListener("mousedown", mouseDownHandler);
};

/**
 * @param e HTMLDivElement
 * @returns: None
 * @description : search review when the main tag is clicked
 */
const handleOnClickMainTag = (e: HTMLInputElement) => {
  // window.scrollTo(0, 0);
  // TODO: 지지님 이 위치에 스크롤 맨 위로 갈 수 있는 함수 하나만 넣어주세요....
  // e.set("checked");
  // console.log(e);
  // if (e) {
  //   if (e.className.length <= 8) {
  //     e.className = e.className + " selected";
  //   } else {
  //     e.className = e.className.slice(0, 8);
  //   }
  // }
};

/**
 * @param e HTMLDivElement
 * @returns: None
 * @description : like or unlikt tag when the card tag is clicked .
 */
const handleOnClickCardTag = (e: HTMLDivElement) => {
  const body: BodyInit = JSON.stringify({
    reviewId: e.parentElement?.parentElement?.id,
    tagId: e.id,
  });
  if (e.className.length <= 8) {
    e.className = e.className + " selected";
    //like
    fetch("/like", {
      method: "PUT",
      headers: headers,
      body: body,
    });
  } else {
    e.className = e.className.slice(0, 8);
    // unlike
    fetch("/unlike", {
      method: "DELETE",
      headers: headers,
      body: body,
    });
  }
};

/**
 * @param e HTMLDivElement
 * @returns: None
 * @description : like or unlikt tag when the card tag is clicked .
 */
const handleOnClickAddTag = (e: HTMLDivElement) => {
  const tagIds = document.getElementById("tagIds") as HTMLInputElement;
  const set = new Set();
  tagIds.value.split(",").map((i) => set.add(i));

  if (e.className.length <= 8) {
    e.className = e.className + " selected";
    //태그추가
    set.add(e.id);
  } else {
    e.className = e.className.slice(0, 8);
    //태그삭제
    set.delete(e.id);
  }
  set.delete("");

  tagIds.value = Array.from(set).toString();
};
