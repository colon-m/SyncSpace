import React from 'react';
import { useSelector,useDispatch } from 'react-redux';
import {useLocation,useNavigate} from 'react-router';
import { Tag, Space } from 'antd';

import "./index.css";
import { removeTag } from '../../store/reducers/tag';

const CommonTags = () => {
    const tags = useSelector(state => state.tags.tags);
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const handleSelect = (tag) => {
        navigate(tag.path);
    };
    const handleRemove = (e,tag) => {
        e.preventDefault();
        const curTagIndex = tags.findIndex(t => t.name === tag.name);
        if(tags.length === 1) {
            dispatch(removeTag(tag));
            navigate('/');
            return;
        }
        const targetIndex = curTagIndex === tags.length - 1 ? curTagIndex - 1 : curTagIndex + 1;
        dispatch(removeTag(tag));
        navigate(tags[targetIndex].path);
    }
    return (
    <div className='tags-container'>
        <Space>
        {tags.map(tag => (
            <Tag
                className={`tag ${tag.path === location.pathname ? 'active' : ''}`}
                key={tag.name}
                onClick={() => handleSelect(tag)}
                closeIcon={tag.path === location.pathname} 
                onClose={(e)=>handleRemove(e, tag)}
            >
            {tag.name}
            </Tag>
        ))}
        </Space>
    </div>
    );
};

export default CommonTags;
