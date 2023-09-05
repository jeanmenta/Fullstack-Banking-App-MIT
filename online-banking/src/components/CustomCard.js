import React from 'react';
import styled from 'styled-components';
import { Card } from 'react-bootstrap';

const StyledCard = styled(Card)`
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  border: none;
  border-radius: 12px;
`;

const CustomCardBody = ({ children, ...props }) => {
    return <Card.Body {...props}>{children}</Card.Body>;
};

function CustomCard({ img, title, children, style, ...props }) {
    const { description, width, ...domProps } = props;
    return (
        <div className={`col-${width}`}>
            <div className="d-flex justify-content-center">
                <StyledCard className="p-0 bg-dark text-white" style={{ ...style }} {...domProps}>
                    {img && <Card.Img variant="top" src={img} />}
                    <CustomCardBody className="bg-dark p-0">
                        {title && <Card.Title>{title}</Card.Title>}
                        <div>{children}</div>
                    </CustomCardBody>
                </StyledCard>
            </div>
        </div>
    );
}

CustomCard.Body = CustomCardBody;

export default CustomCard;
