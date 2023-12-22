import { h, Fragment } from 'preact';
import { useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';

import styles from '../assets/styles/HideFriendsList.module.scss';
import { Modal, Tree } from 'antd';

export const injectOn = '.lol-social-lower-pane-container';

const HideFriendsList = () => {

  const [visible, setVisible] = useState(false);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [treeData, setTreeData] = useState([]);


  const fetchData = async () => {
    const groupsRes = await fetch('/lol-chat/v1/friend-groups');
    const groups = await groupsRes.json();
    console.log("friend-groups:", groups);
    const friendsRes = await fetch('/lol-chat/v1/friends');
    const friends = await friendsRes.json();
    console.log("friends:", friends);
    const treeData = groups.map((group: { name: any; id: any; }) => {
      return {
        title: group.name,
        key: group.id,
        children: friends.filter((friend: { groupId: any; }) => friend.groupId === group.id).sort((a: any, b: any) => {
          if (b.time - a.time !== 0) {
            return b.time - a.time;
          } else if (b.summonerId - a.summonerId !== 0) {
            return b.summonerId - a.summonerId;
          } else {
            return b.id - a.id;
          }
        }).map((friend: { name: any; id: any; }) => {
          return {
            title: friend.name,
            key: friend.id
          }
        })
      }
    });
    setTreeData(treeData);
  }



  const batchDelete = () => {
    console.log(checkedKeys);
    if (checkedKeys.length === 0) {
      Modal.warning({content: '请选择要删除的好友'});
      return;
    }
    for (let i = 0; i < checkedKeys.length; i++) {
      const key = checkedKeys[i];
      if (typeof key === 'string') {
        fetch(`/lol-chat/v1/friends/${key}`, {
          method: 'DELETE'
        });
      }
    }
    setCheckedKeys([]);
    Modal.success({content: '删除成功', onOk: () => {
      setVisible(false);
    }});
    
  }

  const onDel = () => {
    setVisible(true);
    fetchData();
  }

  const onCheck = (checkedKeys: any, info: any) => {
    console.log('onCheck', checkedKeys, info);
    setCheckedKeys(checkedKeys);
  }

  return (
    <>
      {createPortal(
        <span className="action-bar-button ember-view" onClick={() => onDel()}>
          <div className={styles.icon} />
        </span>,
        document.querySelector('.actions-bar .buttons') ?? document.head
      )}
      {
        createPortal(
          <Modal title="批量删除好友" okText={'删除'} cancelText={'取消'} onOk={() => batchDelete()} onCancel={() => setVisible(false)} open={visible}>
            <Tree height={500} autoExpandParent checkable onCheck={onCheck} checkedKeys={checkedKeys} treeData={treeData} />
          </Modal>,document.body
        )
      }
    </>
  );
};

HideFriendsList.on = injectOn;

export default HideFriendsList;
