import styled from 'styled-components';

const CardContainer = styled.div`
  border-radius: 8px;
  padding: ${({ padding }) => padding || '1.5rem'};
  margin-bottom: ${({ marginBottom }) => marginBottom || '1.5rem'};
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  
  ${({ hoverable }) => hoverable && `
    cursor: pointer;
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
    }
  `}
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  ${({ noDivider }) => !noDivider && `
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--borderColor);
  `}
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardBody = styled.div`
  color: var(--textPrimary);
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: ${({ align }) => align || 'flex-end'};
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--borderColor);
  gap: 0.75rem;
`;

const Card = ({ 
  children, 
  title, 
  icon,
  titleAction,
  footer,
  footerAlign,
  noDivider = false,
  hoverable = false,
  padding,
  marginBottom,
  ...props 
}) => {
  return (
    <CardContainer 
      hoverable={hoverable} 
      padding={padding} 
      marginBottom={marginBottom}
      {...props}
    >
      {(title || titleAction) && (
        <CardHeader noDivider={noDivider}>
          {title && (
            <CardTitle>
              {icon && icon}
              {title}
            </CardTitle>
          )}
          {titleAction}
        </CardHeader>
      )}
      <CardBody>{children}</CardBody>
      {footer && (
        <CardFooter align={footerAlign}>
          {footer}
        </CardFooter>
      )}
    </CardContainer>
  );
};

export default Card; 